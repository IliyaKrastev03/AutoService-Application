using AutoService.API.Data;
using AutoService.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Net;
using System.Net.Mail;

namespace AutoService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null || string.IsNullOrEmpty(user.PasswordHash) || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return BadRequest("Грешна парола или имейл (или профилът все още не е активиран).");

            if (!user.IsActive)
                return BadRequest("Този профил е деактивиран от управителя.");

            string token = CreateToken(user);
            return Ok(new { token = token, role = user.Role, username = user.Username });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest("Този имейл вече е зает!");
            }

            var secretToken = Guid.NewGuid().ToString("N");

            var newUser = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = "", 
                Role = request.Role,
                CreatedAt = DateTime.Now,
                IsEmailConfirmed = true,
                IsActive = true,
                CompensationType = request.CompensationType ?? "Percentage",
                CommissionPercentage = request.CommissionPercentage != 0 ? request.CommissionPercentage : 40,
                MonthlySalary = request.CompensationType == "Salary" ? request.MonthlySalary : 0,

                ResetPasswordToken = secretToken,
                ResetPasswordTokenExpiry = DateTime.Now.AddHours(24)
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            var resetLink = $"https://auto-service-application.vercel.app/set-password?token={secretToken}";
            string emailBody = $"<h3>Добре дошли в екипа на AutoService!</h3><p>Вашият профил беше създаден успешно.</p><p>Моля, кликнете на долния линк, за да си зададете лична парола и да влезете в системата:</p><br/><a href='{resetLink}' style='padding: 10px 20px; background-color: #3498db; color: white; text-decoration: none; border-radius: 5px;'>Задаване на парола</a><br/><br/><p>Линкът е валиден 24 часа.</p>";

            await SendEmailAsync(newUser.Email, "Създаден профил - AutoService", emailBody);

            return Ok(new { Message = "Служителят е създаден успешно! Изпратен му е имейл за парола." });
        }

        [HttpPost("reset-password/{id}")]
        public async Task<IActionResult> ResetPassword(int id) 
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound("Потребителят не е намерен.");
            }

            var secretToken = Guid.NewGuid().ToString("N");
            user.ResetPasswordToken = secretToken;
            user.ResetPasswordTokenExpiry = DateTime.Now.AddHours(24);
            await _context.SaveChangesAsync();

            var resetLink = $"https://auto-service-application.vercel.app/set-password?token={secretToken}";
            string emailBody = $"<h3>Смяна на парола</h3><p>Беше заявена смяна на вашата парола.</p><p>Кликнете на линка, за да въведете нова парола:</p><br/><a href='{resetLink}' style='padding: 10px 20px; background-color: #e74c3c; color: white; text-decoration: none; border-radius: 5px;'>Смяна на парола</a><br/><br/><p>Ако не сте вие, игнорирайте този имейл.</p>";

            await SendEmailAsync(user.Email, "Възстановяване на парола - AutoService", emailBody);

            return Ok(new { message = "Изпратен е имейл с линк за нова парола!" });
        }

        [HttpPost("complete-password-setup")]
        public async Task<IActionResult> CompletePasswordSetup([FromBody] SetPasswordDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.ResetPasswordToken == request.Token);

            if (user == null || user.ResetPasswordTokenExpiry < DateTime.Now)
            {
                return BadRequest("Невалиден или изтекъл линк за парола.");
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

            user.ResetPasswordToken = null;
            user.ResetPasswordTokenExpiry = null;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Паролата е зададена успешно! Вече можете да влезете." });
        }

        private async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            try
            {
                string fromEmail = "autoservicehaskovo@gmail.com";
                string appPassword = "zejvuqaodruwqazl";

                var smtpClient = new SmtpClient("smtp.gmail.com")
                {
                    Port = 587,
                    Credentials = new NetworkCredential(fromEmail, appPassword),
                    EnableSsl = true,
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(fromEmail, "AutoService Manager"),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true,
                };
                mailMessage.To.Add(toEmail);

                await smtpClient.SendMailAsync(mailMessage);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Грешка при пращане на имейл: " + ex.Message);
            }
        }

        private string CreateToken(User user)
        {
            List<Claim> claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                _configuration.GetSection("JwtSettings:SecretKey").Value!));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .Where(u => u.IsActive)
                .Select(u => new { u.Id, Name = u.Username, u.Email, u.Role, u.CompensationType, u.CommissionPercentage, u.MonthlySalary })
                .ToListAsync();
            return Ok(users);
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("Потребителят не е намерен.");

            user.IsActive = false;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Потребителят е деактивиран успешно!" });
        }

        [HttpGet("fix-users")]
        public async Task<IActionResult> FixUsers()
        {
            var users = await _context.Users.ToListAsync();
            foreach (var u in users)
            {
                u.IsActive = true;
            }
            await _context.SaveChangesAsync();
            return Ok("Всички служители са възстановени и отново са активни!");
        }
    }

    public class SetPasswordDto
    {
        public string Token { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}