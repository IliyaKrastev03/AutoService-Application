using AutoService.API.Models;
using Microsoft.EntityFrameworkCore;

namespace AutoService.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Vehicle> Vehicles { get; set; }
        public DbSet<Repair> Repairs { get; set; }
        public DbSet<RepairPart> RepairParts { get; set; }
        public DbSet<VehicleOwnership> VehicleOwnerships { get; set; }

        // 🌟 НОВО: ТУК СПИРАМЕ ПАНИКАТА НА SQL SERVER 🌟
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Забраняваме автоматичното триене на историята, ако се изтрие Клиент
            modelBuilder.Entity<VehicleOwnership>()
                .HasOne(vo => vo.Customer)
                .WithMany()
                .HasForeignKey(vo => vo.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            // Забраняваме автоматичното триене на историята, ако се изтрие Кола
            modelBuilder.Entity<VehicleOwnership>()
                .HasOne(vo => vo.Vehicle)
                .WithMany()
                .HasForeignKey(vo => vo.VehicleId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
