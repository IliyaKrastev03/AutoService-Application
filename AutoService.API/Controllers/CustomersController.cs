using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoService.API.Models;
using AutoService.API.Data;

namespace AutoService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CustomersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetCustomers()
        {
            var customers = await _context.Customers
                                          .Include(c => c.Vehicles)
                                          .ToListAsync();
            return Ok(customers);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCustomerProfile(int id)
        {
            var customer = await _context.Customers
                                         .Include(c => c.Vehicles) // Взима текущите коли
                                         .FirstOrDefaultAsync(c => c.Id == id);

            if (customer == null)
            {
                return NotFound("Клиентът не е намерен.");
            }

            // 🌟 НОВО: Намираме колите, които е притежавал преди, но вече са продадени (имат EndDate)
            var previousVehicles = await _context.VehicleOwnerships
                .Include(vo => vo.Vehicle)
                .Where(vo => vo.CustomerId == id && vo.EndDate != null)
                .Select(vo => vo.Vehicle)
                .Distinct() // Махаме дубликати, ако случайно я е купувал и продавал 2 пъти
                .ToListAsync();

            // Връщаме комбиниран обект към React
            return Ok(new
            {
                Id = customer.Id,
                FirstName = customer.FirstName,
                LastName = customer.LastName,
                Phone = customer.Phone,
                Email = customer.Email,
                Address = customer.Address,
                CreatedAt = customer.CreatedAt,
                Vehicles = customer.Vehicles,
                PreviousVehicles = previousVehicles // Изпращаме архива към React
            });
        }

        [HttpPost]
        public async Task<IActionResult> AddCustomer([FromBody] Customer customer)
        {
            customer.CreatedAt = DateTime.Now;

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            return Ok(customer);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> EditCustomer(int id, [FromBody] Customer updatedCustomer)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
            {
                return NotFound("Клиентът не е намерен.");
            }

            customer.FirstName = updatedCustomer.FirstName;
            customer.LastName = updatedCustomer.LastName;
            customer.Phone = updatedCustomer.Phone;
            customer.Email = updatedCustomer.Email;
            customer.Address = updatedCustomer.Address;

            await _context.SaveChangesAsync();

            return Ok(customer);
        }
    }
}