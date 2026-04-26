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
        public DbSet<RepairPhoto> RepairPhotos { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<VehicleOwnership>()
                .HasOne(vo => vo.Customer)
                .WithMany()
                .HasForeignKey(vo => vo.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<VehicleOwnership>()
                .HasOne(vo => vo.Vehicle)
                .WithMany()
                .HasForeignKey(vo => vo.VehicleId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
