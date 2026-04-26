using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.Text.Json.Serialization;

namespace AutoService.API.Models
{
    public class Repair
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Description { get; set; }

        public string RepairType { get; set; } = "Ремонт"; 
        public string? Complaint { get; set; } 

        public string Status { get; set; } = "Чакащ";

        [Column(TypeName = "decimal(18,2)")]
        public decimal PartsCost { get; set; } = 0; 
        [Column(TypeName = "decimal(18,2)")]
        public decimal LaborCost { get; set; } = 0; 

        public int WorkedHours { get; set; } = 0;
        public int WorkedMinutes { get; set; } = 0;
        public int Mileage { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? CompletedAt { get; set; }

        [Required]
        public int VehicleId { get; set; }

        [ForeignKey("VehicleId")]
        [ValidateNever]
        public virtual Vehicle Vehicle { get; set; }

        public string? MechanicId { get; set; }

        public virtual ICollection<RepairPart> Parts { get; set; } = new List<RepairPart>();
        public virtual ICollection<RepairPhoto> Photos { get; set; } = new List<RepairPhoto>();
    }
}