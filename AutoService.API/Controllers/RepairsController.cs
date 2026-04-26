using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoService.API.Models;
using AutoService.API.Data;

namespace AutoService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RepairsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RepairsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> AddRepair([FromBody] Repair repair)
        {
            var vehicle = await _context.Vehicles.FindAsync(repair.VehicleId);
            if (vehicle == null)
            {
                return NotFound("Автомобилът не е намерен!");
            }

            _context.Repairs.Add(repair);
            await _context.SaveChangesAsync();

            return Ok(repair);
        }

        [HttpGet("vehicle/{vehicleId}")]
        public async Task<IActionResult> GetRepairsForVehicle(int vehicleId)
        {
            var repairs = await _context.Repairs
                .Include(r => r.Parts)
                .Include(r => r.Photos)
                .Where(r => r.VehicleId == vehicleId)
                .OrderByDescending(r => r.CreatedAt) 
                .ToListAsync();

            return Ok(repairs);
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActiveRepairs()
        {
            var activeRepairs = await _context.Repairs
                .Include(r => r.Vehicle) 
                .ThenInclude(v => v.Customer) 
                .Where(r => r.Status != "Завършен") 
                .OrderBy(r => r.CreatedAt)
                .ToListAsync();

            return Ok(activeRepairs);
        }

        [HttpGet("mechanics")]
        public async Task<IActionResult> GetMechanics()
        {
            var mechanics = await _context.Users
                .Where(u => u.Role == "Mechanic" && u.IsActive)
                .Select(u => new { u.Id, Name = u.Username })
                .ToListAsync();

            return Ok(mechanics);
        }

        [HttpPut("{id}/assign")]
        public async Task<IActionResult> AssignMechanic(int id, [FromBody] string mechanicName)
        {
            var repair = await _context.Repairs.FindAsync(id);
            if (repair == null) return NotFound("Ремонтът не е намерен!");

            repair.MechanicId = mechanicName;
            repair.Status = "В процес"; 

            await _context.SaveChangesAsync();
            return Ok(repair);
        }

        [HttpGet("mechanic/{mechanicName}")]
        public async Task<IActionResult> GetRepairsForMechanic(string mechanicName)
        {
            var repairs = await _context.Repairs
                .Include(r => r.Vehicle)
                .ThenInclude(v => v.Customer)
                .Where(r => r.MechanicId == mechanicName && r.Status == "В процес")
                .OrderBy(r => r.CreatedAt)
                .ToListAsync();

            return Ok(repairs);
        }

        [HttpPut("{id}/complete")]
        public async Task<IActionResult> CompleteRepairByMechanic(int id, [FromBody] CompleteRepairDto timeReport)
        {
            var repair = await _context.Repairs.FindAsync(id);
            if (repair == null) return NotFound("Ремонтът не е намерен!");

            repair.WorkedHours = timeReport.WorkedHours;
            repair.WorkedMinutes = timeReport.WorkedMinutes;

            repair.Status = "Завършен от механик (Чака цена)";

            await _context.SaveChangesAsync();
            return Ok(repair);
        }
        [HttpPut("{id}/costing")]
        public async Task<IActionResult> UpdateRepairCosting(int id, [FromBody] CostingDto costing)
        {
            var repair = await _context.Repairs
                .Include(r => r.Parts)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (repair == null) return NotFound("Ремонтът не е намерен!");

            _context.RepairParts.RemoveRange(repair.Parts);

            decimal totalPartsPrice = 0;
            foreach (var p in costing.Parts)
            {
                var newPart = new RepairPart
                {
                    Name = p.Name,
                    PartNumber = p.PartNumber,
                    Price = p.Price,
                    Quantity = p.Quantity,
                    RepairId = repair.Id
                };
                _context.RepairParts.Add(newPart);
                totalPartsPrice += (p.Price * p.Quantity);
            }

            repair.PartsCost = totalPartsPrice;
            repair.LaborCost = costing.LaborCost;

            if (repair.Status == "Завършен от механик (Чака цена)" || string.IsNullOrEmpty(repair.MechanicId))
            {
                repair.Status = "Остойностен (Чака плащане)";
            }

            await _context.SaveChangesAsync();
            return Ok(repair);
        }
        [HttpPut("{id}/pay")]
        public async Task<IActionResult> PayAndCompleteRepair(int id)
        {
            var repair = await _context.Repairs.FindAsync(id);
            if (repair == null) return NotFound("Ремонтът не е намерен!");

            repair.Status = "Завършен";

            await _context.SaveChangesAsync();
            return Ok(repair);
        }
        [HttpPost("{id}/photos")]
        public async Task<IActionResult> AddRepairPhoto(int id, [FromBody] PhotoDto photoDto)
        {
            var repair = await _context.Repairs.FindAsync(id);
            if (repair == null) return NotFound("Ремонтът не е намерен!");

            if (string.IsNullOrEmpty(photoDto.ImageUrl))
            {
                return BadRequest("Липсва линк към снимката.");
            }

            var newPhoto = new RepairPhoto
            {
                RepairId = id,
                ImageUrl = photoDto.ImageUrl
            };

            _context.RepairPhotos.Add(newPhoto);
            await _context.SaveChangesAsync();

            return Ok(newPhoto);
        }
    }
    public class CompleteRepairDto
    {
        public int WorkedHours { get; set; }
        public int WorkedMinutes { get; set; }
    }
    public class CostingDto
    {
        public decimal LaborCost { get; set; }
        public List<RepairPartDto> Parts { get; set; } = new List<RepairPartDto>();
    }

    public class RepairPartDto
    {
        public string Name { get; set; }
        public string? PartNumber { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
    }
}