using System;
using System.Text.Json.Serialization;

namespace AutoService.API.Models
{
    public class RepairPhoto
    {
        public int Id { get; set; }

        public int RepairId { get; set; }

        public string ImageUrl { get; set; }

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        [JsonIgnore]
        public Repair Repair { get; set; }
    }
}