using AutoService.API.Data;
using AutoService.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DashboardController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats([FromQuery] int? month, [FromQuery] int? year)
        {
            var allRepairs = await _context.Repairs.Where(r => r.Status == "Завършен").ToListAsync();
            var usersDb = await _context.Users.ToListAsync();

            int targetMonth = month ?? DateTime.Now.Month;
            int targetYear = year ?? DateTime.Now.Year;

            var calculateStats = (IEnumerable<Repair> repairs, bool isMonthly) =>
            {
                decimal partsTurnover = repairs.Sum(r => r.PartsCost);
                decimal laborRevenue = repairs.Sum(r => r.LaborCost);

                decimal totalCommissions = 0;
                foreach (var r in repairs)
                {
                    if (!string.IsNullOrEmpty(r.MechanicId))
                    {
                        var mechanic = usersDb.FirstOrDefault(u => u.Username == r.MechanicId);
                        if (mechanic != null && mechanic.CompensationType == "Percentage")
                            totalCommissions += r.LaborCost * (mechanic.CommissionPercentage / 100m);
                    }
                }

                decimal salariesExpense = 0;
                var activeSalariedMechanics = usersDb.Where(u => u.Role == "Mechanic" && u.CompensationType == "Salary" && u.IsActive);

                foreach (var mechanic in activeSalariedMechanics)
                {
                    if (isMonthly)
                    {
                        if (mechanic.CreatedAt.Year < targetYear || (mechanic.CreatedAt.Year == targetYear && mechanic.CreatedAt.Month <= targetMonth))
                        {
                            salariesExpense += mechanic.MonthlySalary;
                        }
                    }
                    else
                    {
                        if (mechanic.CreatedAt.Year <= targetYear)
                        {
                            int startMonth = (mechanic.CreatedAt.Year == targetYear) ? mechanic.CreatedAt.Month : 1;

                            int endMonth = (targetYear == DateTime.Now.Year) ? DateTime.Now.Month : 12;

                            int monthsWorked = endMonth - startMonth + 1;

                            if (monthsWorked > 0)
                            {
                                salariesExpense += mechanic.MonthlySalary * monthsWorked;
                            }
                        }
                    }
                }

                decimal totalPersonnelExpenses = totalCommissions + salariesExpense;
                decimal netProfit = laborRevenue - totalPersonnelExpenses;

                return new
                {
                    TotalTurnover = partsTurnover + laborRevenue,
                    PartsCost = partsTurnover,
                    LaborRevenue = laborRevenue,
                    CommissionsPaid = totalCommissions,
                    SalariesPaid = salariesExpense,
                    NetProfit = netProfit,
                    RepairsCount = repairs.Count()
                };
            };

            var selectedMonthRepairs = allRepairs.Where(r => r.CreatedAt.Month == targetMonth && r.CreatedAt.Year == targetYear).ToList();
            var selectedYearRepairs = allRepairs.Where(r => r.CreatedAt.Year == targetYear).ToList();

            var mechanicStats = usersDb.Where(u => u.Role == "Mechanic").Select(m =>
            {
                var myRepairs = selectedMonthRepairs.Where(r => r.MechanicId == m.Username).ToList();
                decimal laborGenerated = myRepairs.Sum(r => r.LaborCost);
                decimal pay = m.CompensationType == "Percentage"
                    ? laborGenerated * (m.CommissionPercentage / 100m)
                    : (m.IsActive ? m.MonthlySalary : 0);

                return new
                {
                    MechanicName = m.Username + (!m.IsActive ? " (Неактивен)" : ""),
                    RepairsCount = myRepairs.Count,
                    TotalHours = myRepairs.Sum(r => r.WorkedHours) + (myRepairs.Sum(r => r.WorkedMinutes) / 60),
                    TotalMinutes = myRepairs.Sum(r => r.WorkedMinutes) % 60,
                    GeneratedLaborRevenue = laborGenerated,
                    MechanicPay = pay,
                    CompensationInfo = m.CompensationType == "Percentage" ? $"{m.CommissionPercentage}% Заработка" : $"Твърда: {m.MonthlySalary} €"
                };
            }).Where(m => m.RepairsCount > 0 || m.MechanicPay > 0).OrderByDescending(m => m.GeneratedLaborRevenue).ToList();

            return Ok(new
            {
                CurrentMonth = calculateStats(selectedMonthRepairs, true),
                CurrentYear = calculateStats(selectedYearRepairs, false),
                MechanicStats = mechanicStats
            });
        }

        [HttpGet("mechanic-stats/{username}")]
        public async Task<IActionResult> GetMechanicStats(string username)
        {
            var mechanic = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
            if (mechanic == null) return NotFound("Механикът не е намерен.");

            var currentDate = DateTime.Now;
            var repairs = await _context.Repairs
                .Where(r => r.Status == "Завършен" && r.MechanicId == username && r.CreatedAt.Month == currentDate.Month && r.CreatedAt.Year == currentDate.Year)
                .ToListAsync();

            bool isPercentage = mechanic.CompensationType == "Percentage";
            decimal earnedMoney = isPercentage ? repairs.Sum(r => r.LaborCost) * (mechanic.CommissionPercentage / 100m) : mechanic.MonthlySalary;

            return Ok(new
            {
                MechanicName = mechanic.Username,
                CompensationInfo = isPercentage ? $"{mechanic.CommissionPercentage}% Заработка" : $"Твърда Заплата: {mechanic.MonthlySalary} €",
                RepairsCount = repairs.Count,
                TotalHours = repairs.Sum(r => r.WorkedHours) + (repairs.Sum(r => r.WorkedMinutes) / 60),
                TotalMinutes = repairs.Sum(r => r.WorkedMinutes) % 60,
                EarnedMoney = earnedMoney
            });
        }
    }
}