using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoService.API.Models;
using AutoService.API.Data;

namespace AutoService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VehiclesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public VehiclesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 🌟 1. УМНОТО ДОБАВЯНЕ НА КОЛА 🌟
        [HttpPost]
        public async Task<IActionResult> AddVehicle([FromBody] Vehicle vehicle)
        {
            var customer = await _context.Customers.FindAsync(vehicle.CustomerId);
            if (customer == null)
            {
                return NotFound("Собственикът (клиентът) не е намерен!");
            }

            // ПРОВЕРКА ЗА СЪЩЕСТВУВАЩ VIN НОМЕР
            var existingVehicle = await _context.Vehicles
                .Include(v => v.Customer) // Взимаме и стария собственик, за да му видим името
                .FirstOrDefaultAsync(v => v.VIN.ToLower() == vehicle.VIN.ToLower());

            if (existingVehicle != null)
            {
                // Ако колата вече се води на СЪЩИЯ клиент (просто се опитва да я добави пак)
                if (existingVehicle.CustomerId == vehicle.CustomerId)
                {
                    return BadRequest("Този автомобил вече е добавен към този клиент!");
                }

                // АКО КОЛАТА Е НА ДРУГ КЛИЕНТ -> Връщаме специален статус 409 (Конфликт)
                // React ще разчете това и ще покаже прозорец "Искате ли да я прехвърлите?"
                return StatusCode(409, new
                {
                    Message = $"Внимание! Автомобил с този VIN вече съществува в системата и се води собственост на {existingVehicle.Customer.FirstName} {existingVehicle.Customer.LastName}.",
                    ExistingVehicleId = existingVehicle.Id,
                    OldCustomerId = existingVehicle.CustomerId,
                    NewCustomerId = vehicle.CustomerId
                });
            }

            // АКО КОЛАТА Е ЧИСТО НОВА: Записваме я в базата
            _context.Vehicles.Add(vehicle);
            await _context.SaveChangesAsync();

            // 🌟 Създаваме първия запис в Нотариалната книга (VehicleOwnership)
            var ownership = new VehicleOwnership
            {
                VehicleId = vehicle.Id,
                CustomerId = vehicle.CustomerId,
                StartDate = DateTime.Now
            };
            _context.VehicleOwnerships.Add(ownership);
            await _context.SaveChangesAsync();

            return Ok(vehicle);
        }

        // 🌟 2. ЧИСТО НОВ МЕТОД: ПРЕХВЪРЛЯНЕ НА СОБСТВЕНОСТ 🌟
        [HttpPost("{vin}/transfer/{newCustomerId}")]
        public async Task<IActionResult> TransferVehicle(string vin, int newCustomerId)
        {
            var vehicle = await _context.Vehicles.FirstOrDefaultAsync(v => v.VIN.ToLower() == vin.ToLower());
            if (vehicle == null) return NotFound("Автомобилът не е намерен!");

            var newCustomer = await _context.Customers.FindAsync(newCustomerId);
            if (newCustomer == null) return NotFound("Новият клиент не е намерен!");

            // 1. Намираме АКТИВНАТА нотариална книга на стария собственик (тази, която няма EndDate)
            var activeOwnership = await _context.VehicleOwnerships
                .FirstOrDefaultAsync(vo => vo.VehicleId == vehicle.Id && vo.EndDate == null);

            // 2. Затваряме я (слагаме крайна дата днес)
            if (activeOwnership != null)
            {
                activeOwnership.EndDate = DateTime.Now;
            }

            // 3. Местим колата при новия собственик и я правим активна (в случай че е била архивирана)
            vehicle.CustomerId = newCustomerId;
            vehicle.IsArchived = false;

            // 4. Отваряме нова нотариална книга за новия собственик
            var newOwnership = new VehicleOwnership
            {
                VehicleId = vehicle.Id,
                CustomerId = newCustomerId,
                StartDate = DateTime.Now
            };

            _context.VehicleOwnerships.Add(newOwnership);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Собствеността е прехвърлена успешно!", Vehicle = vehicle });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetVehicle(int id)
        {
            var vehicle = await _context.Vehicles.FindAsync(id);

            if (vehicle == null)
            {
                return NotFound("Автомобилът не е намерен.");
            }

            return Ok(vehicle);
        }

        [HttpPut("{id}/archive")]
        public async Task<IActionResult> ArchiveVehicle(int id)
        {
            var vehicle = await _context.Vehicles.FindAsync(id);
            if (vehicle == null) return NotFound("Автомобилът не е намерен!");

            // 1. Архивираме колата
            vehicle.IsArchived = true;

            // 2. 🌟 НОВО: Намираме активната собственост и я ЗАТВАРЯМЕ (слагаме крайна дата)
            var activeOwnership = await _context.VehicleOwnerships
                .FirstOrDefaultAsync(vo => vo.VehicleId == vehicle.Id && vo.EndDate == null);

            if (activeOwnership != null)
            {
                activeOwnership.EndDate = DateTime.Now;
            }

            await _context.SaveChangesAsync();

            return Ok(vehicle);
        }

        [HttpGet("search/{vin}")]
        public async Task<IActionResult> SearchByVin(string vin)
        {
            var vehicle = await _context.Vehicles
                .Include(v => v.Customer)
                .FirstOrDefaultAsync(v => v.VIN.ToLower() == vin.ToLower());

            if (vehicle == null) return NotFound("Автомобил с този VIN не е намерен в системата.");

            var repairs = await _context.Repairs
                .Include(r => r.Parts)
                .Where(r => r.VehicleId == vehicle.Id)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            // 🌟 НОВО: Взимаме пълната история на собствеността на тази кола 🌟
            var ownershipHistory = await _context.VehicleOwnerships
                .Include(vo => vo.Customer)
                .Where(vo => vo.VehicleId == vehicle.Id)
                .OrderByDescending(vo => vo.StartDate) // Най-новите собственици най-отгоре
                .Select(vo => new {
                    OwnerName = vo.Customer.FirstName + " " + vo.Customer.LastName,
                    OwnerPhone = vo.Customer.Phone,
                    StartDate = vo.StartDate,
                    EndDate = vo.EndDate,
                    IsCurrentOwner = vo.EndDate == null // Ако няма крайна дата, значи е настоящ
                })
                .ToListAsync();

            return Ok(new
            {
                Vehicle = vehicle,
                Repairs = repairs,
                OwnershipHistory = ownershipHistory // Изпращаме историята към React
            });
        }
    }
}