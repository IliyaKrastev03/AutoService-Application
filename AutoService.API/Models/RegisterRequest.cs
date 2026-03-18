namespace AutoService.API.Models
{
    public class RegisterRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? CompensationType { get; set; }
        public decimal CommissionPercentage { get; set; }
        public decimal MonthlySalary { get; set; }
    }
}