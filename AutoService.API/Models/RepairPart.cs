using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace AutoService.API.Models
{
    public class RepairPart
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } 

        public string? PartNumber { get; set; }

        [Required]
        public decimal Price { get; set; }

        [Required]
        public int Quantity { get; set; } = 1;

        [Required]
        public int RepairId { get; set; }

        [ForeignKey("RepairId")]
        [JsonIgnore]
        public virtual Repair? Repair { get; set; }
    }
}