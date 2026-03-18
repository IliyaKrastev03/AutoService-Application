namespace AutoService.API.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool IsEmailConfirmed { get; set; }
        public string? VerificationToken { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CompensationType { get; set; } = "Percentage";
        public decimal CommissionPercentage { get; set; } = 40; 
        public decimal MonthlySalary { get; set; } = 0;
        public bool IsActive { get; set; } = true;
    }
}