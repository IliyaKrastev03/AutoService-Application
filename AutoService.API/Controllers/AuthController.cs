using AutoService.API.Data;
using AutoService.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

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
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return BadRequest("Грешна парола или имейл.");

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

            var newUser = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = request.Role,
                CreatedAt = DateTime.Now,
                IsEmailConfirmed = true,

                IsActive = true,

                CompensationType = request.CompensationType ?? "Percentage",
                CommissionPercentage = request.CommissionPercentage != 0 ? request.CommissionPercentage : 40,
                MonthlySalary = request.CompensationType == "Salary" ? request.MonthlySalary : 0
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Успешна регистрация на служител!" });
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

            var jwt = new JwtSecurityTokenHandler().WriteToken(token);
            return jwt;
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

        [HttpPost("reset-password/{id}")]
        public async Task<IActionResult> ResetPassword(int id, [FromBody] ResetPasswordDto request)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound("Потребителят не е намерен.");
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Паролата е променена успешно!" });
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

    public class ResetPasswordDto
    {
        public string NewPassword { get; set; }
    }
}