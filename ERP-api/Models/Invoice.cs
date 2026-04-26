using System.ComponentModel.DataAnnotations;

namespace ErpApi;

public class Invoice
{
    public int Id { get; set; }

    public int CompanyId { get; set; }

    [Required, MaxLength(64)]
    public string InvoiceNumber { get; set; } = string.Empty;

    public DateTime IssueDate { get; set; }
    public DateTime DueDate { get; set; }

    [Required, MaxLength(200)]
    public string ClientName { get; set; } = string.Empty;

    [MaxLength(256)]
    public string? ClientEmail { get; set; }

    [MaxLength(500)]
    public string? ClientAddress { get; set; }

    /// <summary>draft, pending, paid, overdue</summary>
    [Required, MaxLength(20)]
    public string Status { get; set; } = "draft";

    public decimal Subtotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal Total { get; set; }

    public decimal TaxRatePercent { get; set; }

    [MaxLength(100)]
    public string? Terms { get; set; }

    [MaxLength(10)]
    public string Currency { get; set; } = "USD";

    [MaxLength(2000)]
    public string? Notes { get; set; }

    [MaxLength(64)]
    public string? PaymentMethod { get; set; }

    public DateTime? PaidDate { get; set; }

    public DateTime CreatedUtc { get; set; }
    public DateTime? UpdatedUtc { get; set; }

    public ICollection<InvoiceLine> Lines { get; set; } = new List<InvoiceLine>();
}
