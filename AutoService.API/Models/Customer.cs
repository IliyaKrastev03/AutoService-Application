using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace AutoService.API.Models
{
    public class Customer
    {
        [Key]
        public int Id { get; set; }

        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; } 
        public string Address { get; set; } 

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public virtual ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
    }
}
