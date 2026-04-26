using System.ComponentModel.DataAnnotations;

namespace ErpApi
{
    public class Project
    {
        public int Id { get; set; }

        [Required, MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string? Description { get; set; }

        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        [MaxLength(200)]
        public string? Client { get; set; }

        [MaxLength(200)]
        public string? Manager { get; set; }

        [MaxLength(32)]
        public string? Status { get; set; }

        [MaxLength(32)]
        public string? Priority { get; set; }

        public int Progress { get; set; }

        public decimal? Budget { get; set; }

        [MaxLength(500)]
        public string? Tags { get; set; }

        public int CompanyId { get; set; } = 0;

        public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedUtc { get; set; }
    }
}