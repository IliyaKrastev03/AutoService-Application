using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace AutoService.API.Models
{
    public class Vehicle
    {
        [Key]
        public int Id { get; set; }
        public string LicensePlate { get; set; } 
        public string Make { get; set; } 
        public string Model { get; set; }   
        public int Year { get; set; }
        public string Transmission { get; set; } = "Ръчна";
        public string VIN { get; set; }
        public string EngineType { get; set; } 
        public string VehicleType { get; set; } 
        public string Drivetrain { get; set; } 
        public int CustomerId { get; set; }

        [ForeignKey("CustomerId")]
        [ValidateNever]
        public virtual Customer Customer { get; set; }
        public virtual ICollection<Repair> Repairs { get; set; } = new List<Repair>();
        public bool IsArchived { get; set; } = false;
    }
}
