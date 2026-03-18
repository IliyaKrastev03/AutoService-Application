using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AutoService.API.Models
{
    public class VehicleOwnership
    {
        [Key]
        public int Id { get; set; }

        public int VehicleId { get; set; }
        [ForeignKey("VehicleId")]
        public virtual Vehicle Vehicle { get; set; }

        public int CustomerId { get; set; }
        [ForeignKey("CustomerId")]
        public virtual Customer Customer { get; set; }

        // От кога клиентът притежава колата
        public DateTime StartDate { get; set; } = DateTime.Now;

        // До кога я е притежавал. Ако е NULL, значи колата ОЩЕ Е НЕГОВА!
        public DateTime? EndDate { get; set; }
    }
}