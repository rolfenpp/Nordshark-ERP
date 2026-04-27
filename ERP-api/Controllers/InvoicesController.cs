using System.ComponentModel.DataAnnotations;
using ErpApi;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/invoices")]
[Authorize]
public class InvoicesController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ITenantProvider _tenantProvider;

    public InvoicesController(ApplicationDbContext db, ITenantProvider tenantProvider)
    {
        _db = db;
        _tenantProvider = tenantProvider;
    }

    private int GetCompanyId() => _tenantProvider.CompanyId;

    [HttpGet]
    [Authorize(Policy = Permissions.ViewInvoices)]
    public async Task<ActionResult<IEnumerable<InvoiceListDto>>> GetAll()
    {
        var companyId = GetCompanyId();

        var list = await _db.Invoices
            .AsNoTracking()
            .Where(i => i.CompanyId == companyId)
            .OrderByDescending(i => i.IssueDate)
            .Select(i => new InvoiceListDto
            {
                Id = i.Id,
                InvoiceNumber = i.InvoiceNumber,
                IssueDate = i.IssueDate,
                DueDate = i.DueDate,
                ClientName = i.ClientName,
                ClientEmail = i.ClientEmail,
                Subtotal = i.Subtotal,
                TaxAmount = i.TaxAmount,
                Total = i.Total,
                Status = i.Status,
                PaymentMethod = i.PaymentMethod,
                PaidDate = i.PaidDate
            })
            .ToListAsync();

        return Ok(list);
    }

    [HttpGet("{id:int}")]
    [Authorize(Policy = Permissions.ViewInvoices)]
    public async Task<ActionResult<InvoiceDetailDto>> GetById(int id)
    {
        var companyId = GetCompanyId();

        var inv = await _db.Invoices
            .AsNoTracking()
            .Include(i => i.Lines)
            .Where(i => i.Id == id && i.CompanyId == companyId)
            .FirstOrDefaultAsync();

        if (inv is null) return NotFound();

        var lines = inv.Lines
            .OrderBy(l => l.LineNumber)
            .Select(l => new InvoiceLineDto
            {
                Id = l.Id,
                LineNumber = l.LineNumber,
                Description = l.Description,
                Quantity = l.Quantity,
                UnitPrice = l.UnitPrice,
                Amount = l.Amount
            })
            .ToList();

        return Ok(new InvoiceDetailDto
        {
            Id = inv.Id,
            InvoiceNumber = inv.InvoiceNumber,
            IssueDate = inv.IssueDate,
            DueDate = inv.DueDate,
            ClientName = inv.ClientName,
            ClientEmail = inv.ClientEmail,
            ClientAddress = inv.ClientAddress,
            Status = inv.Status,
            Subtotal = inv.Subtotal,
            TaxAmount = inv.TaxAmount,
            Total = inv.Total,
            TaxRatePercent = inv.TaxRatePercent,
            Terms = inv.Terms,
            Currency = inv.Currency,
            Notes = inv.Notes,
            PaymentMethod = inv.PaymentMethod,
            PaidDate = inv.PaidDate,
            CreatedUtc = inv.CreatedUtc,
            UpdatedUtc = inv.UpdatedUtc,
            Lines = lines
        });
    }

    [HttpPost]
    [Authorize(Policy = Permissions.CreateInvoices)]
    public async Task<ActionResult<InvoiceDetailDto>> Create([FromBody] CreateInvoiceDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        if (dto.Lines is not { Count: > 0 })
            return BadRequest("At least one line item is required.");

        var companyId = GetCompanyId();
        var number = (dto.InvoiceNumber ?? string.Empty).Trim();
        if (string.IsNullOrEmpty(number)) return BadRequest("Invoice number is required.");

        if (await _db.Invoices.AnyAsync(i => i.CompanyId == companyId && i.InvoiceNumber == number))
            return Conflict("An invoice with this number already exists.");

        var subtotal = 0m;
        var lines = new List<InvoiceLine>();
        for (var i = 0; i < dto.Lines.Count; i++)
        {
            var line = dto.Lines[i];
            var lineNum = line.LineNumber > 0 ? line.LineNumber : i + 1;
            var lineAmt = line.Quantity * line.UnitPrice;
            subtotal += lineAmt;
            lines.Add(new InvoiceLine
            {
                CompanyId = companyId,
                LineNumber = lineNum,
                Description = (line.Description ?? string.Empty).Trim(),
                Quantity = line.Quantity,
                UnitPrice = line.UnitPrice,
                Amount = lineAmt
            });
        }

        var taxRate = dto.TaxRatePercent;
        if (taxRate < 0) taxRate = 0;
        var tax = Math.Round(subtotal * (taxRate / 100m), 2, MidpointRounding.AwayFromZero);
        var total = subtotal + tax;
        var now = DateTime.UtcNow;

        var entity = new Invoice
        {
            CompanyId = companyId,
            InvoiceNumber = number,
            IssueDate = dto.IssueDate.Kind == DateTimeKind.Unspecified
                ? DateTime.SpecifyKind(dto.IssueDate, DateTimeKind.Utc)
                : dto.IssueDate.ToUniversalTime(),
            DueDate = dto.DueDate.Kind == DateTimeKind.Unspecified
                ? DateTime.SpecifyKind(dto.DueDate, DateTimeKind.Utc)
                : dto.DueDate.ToUniversalTime(),
            ClientName = dto.ClientName.Trim(),
            ClientEmail = string.IsNullOrWhiteSpace(dto.ClientEmail) ? null : dto.ClientEmail.Trim(),
            ClientAddress = string.IsNullOrWhiteSpace(dto.ClientAddress) ? null : dto.ClientAddress.Trim(),
            Status = (dto.Status ?? "draft").Trim().ToLowerInvariant(),
            Subtotal = subtotal,
            TaxAmount = tax,
            Total = total,
            TaxRatePercent = taxRate,
            Terms = string.IsNullOrWhiteSpace(dto.Terms) ? null : dto.Terms.Trim(),
            Currency = string.IsNullOrWhiteSpace(dto.Currency) ? "USD" : dto.Currency.Trim(),
            Notes = string.IsNullOrWhiteSpace(dto.Notes) ? null : dto.Notes.Trim(),
            CreatedUtc = now
        };
        entity.Lines = lines;

        _db.Invoices.Add(entity);
        await _db.SaveChangesAsync();

        var body = await BuildInvoiceDetail(companyId, entity.Id, CancellationToken.None);
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, body);
    }

    private async Task<InvoiceDetailDto> BuildInvoiceDetail(int companyId, int id, CancellationToken ct = default)
    {
        var inv = await _db.Invoices
            .AsNoTracking()
            .Include(i => i.Lines)
            .Where(i => i.Id == id && i.CompanyId == companyId)
            .FirstOrDefaultAsync(ct);

        if (inv is null) throw new InvalidOperationException("Invoice not found after save.");

        var lines = inv.Lines
            .OrderBy(l => l.LineNumber)
            .Select(l => new InvoiceLineDto
            {
                Id = l.Id,
                LineNumber = l.LineNumber,
                Description = l.Description,
                Quantity = l.Quantity,
                UnitPrice = l.UnitPrice,
                Amount = l.Amount
            })
            .ToList();

        return new InvoiceDetailDto
        {
            Id = inv.Id,
            InvoiceNumber = inv.InvoiceNumber,
            IssueDate = inv.IssueDate,
            DueDate = inv.DueDate,
            ClientName = inv.ClientName,
            ClientEmail = inv.ClientEmail,
            ClientAddress = inv.ClientAddress,
            Status = inv.Status,
            Subtotal = inv.Subtotal,
            TaxAmount = inv.TaxAmount,
            Total = inv.Total,
            TaxRatePercent = inv.TaxRatePercent,
            Terms = inv.Terms,
            Currency = inv.Currency,
            Notes = inv.Notes,
            PaymentMethod = inv.PaymentMethod,
            PaidDate = inv.PaidDate,
            CreatedUtc = inv.CreatedUtc,
            UpdatedUtc = inv.UpdatedUtc,
            Lines = lines
        };
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = Permissions.EditInvoices)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateInvoiceDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        if (dto.Lines is not { Count: > 0 }) return BadRequest("At least one line item is required.");

        var companyId = GetCompanyId();
        var entity = await _db.Invoices
            .Include(i => i.Lines)
            .FirstOrDefaultAsync(i => i.Id == id && i.CompanyId == companyId);
        if (entity is null) return NotFound();

        var newNumber = (dto.InvoiceNumber ?? string.Empty).Trim();
        if (string.IsNullOrEmpty(newNumber)) return BadRequest("Invoice number is required.");
        if (!string.Equals(entity.InvoiceNumber, newNumber, StringComparison.Ordinal) &&
            await _db.Invoices.AnyAsync(i => i.CompanyId == companyId && i.InvoiceNumber == newNumber && i.Id != id))
            return Conflict("An invoice with this number already exists.");

        var oldLines = await _db.InvoiceLines.Where(l => l.InvoiceId == entity.Id).ToListAsync();
        _db.InvoiceLines.RemoveRange(oldLines);
        entity.Lines.Clear();

        var subtotal = 0m;
        for (var i = 0; i < dto.Lines.Count; i++)
        {
            var line = dto.Lines[i];
            var lineNum = line.LineNumber > 0 ? line.LineNumber : i + 1;
            var lineAmt = line.Quantity * line.UnitPrice;
            subtotal += lineAmt;
            entity.Lines.Add(new InvoiceLine
            {
                CompanyId = companyId,
                LineNumber = lineNum,
                Description = (line.Description ?? string.Empty).Trim(),
                Quantity = line.Quantity,
                UnitPrice = line.UnitPrice,
                Amount = lineAmt
            });
        }

        var taxRate = dto.TaxRatePercent;
        if (taxRate < 0) taxRate = 0;
        var tax = Math.Round(subtotal * (taxRate / 100m), 2, MidpointRounding.AwayFromZero);
        var total = subtotal + tax;

        entity.InvoiceNumber = newNumber;
        entity.IssueDate = dto.IssueDate.Kind == DateTimeKind.Unspecified
            ? DateTime.SpecifyKind(dto.IssueDate, DateTimeKind.Utc)
            : dto.IssueDate.ToUniversalTime();
        entity.DueDate = dto.DueDate.Kind == DateTimeKind.Unspecified
            ? DateTime.SpecifyKind(dto.DueDate, DateTimeKind.Utc)
            : dto.DueDate.ToUniversalTime();
        entity.ClientName = dto.ClientName.Trim();
        entity.ClientEmail = string.IsNullOrWhiteSpace(dto.ClientEmail) ? null : dto.ClientEmail.Trim();
        entity.ClientAddress = string.IsNullOrWhiteSpace(dto.ClientAddress) ? null : dto.ClientAddress.Trim();
        entity.Status = (dto.Status ?? "draft").Trim().ToLowerInvariant();
        entity.Subtotal = subtotal;
        entity.TaxAmount = tax;
        entity.Total = total;
        entity.TaxRatePercent = taxRate;
        entity.Terms = string.IsNullOrWhiteSpace(dto.Terms) ? null : dto.Terms.Trim();
        entity.Currency = string.IsNullOrWhiteSpace(dto.Currency) ? "USD" : dto.Currency.Trim();
        entity.Notes = string.IsNullOrWhiteSpace(dto.Notes) ? null : dto.Notes.Trim();
        entity.PaymentMethod = string.IsNullOrWhiteSpace(dto.PaymentMethod) ? null : dto.PaymentMethod.Trim();
        entity.PaidDate = dto.PaidDate;
        entity.UpdatedUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = Permissions.DeleteInvoices)]
    public async Task<IActionResult> Delete(int id)
    {
        var companyId = GetCompanyId();
        var entity = await _db.Invoices
            .Include(i => i.Lines)
            .FirstOrDefaultAsync(i => i.Id == id && i.CompanyId == companyId);
        if (entity is null) return NotFound();
        _db.Invoices.Remove(entity);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

public class InvoiceListDto
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public DateTime IssueDate { get; set; }
    public DateTime DueDate { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string? ClientEmail { get; set; }
    public decimal Subtotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal Total { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? PaymentMethod { get; set; }
    public DateTime? PaidDate { get; set; }
}

public class InvoiceDetailDto
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public DateTime IssueDate { get; set; }
    public DateTime DueDate { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string? ClientEmail { get; set; }
    public string? ClientAddress { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal Subtotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal Total { get; set; }
    public decimal TaxRatePercent { get; set; }
    public string? Terms { get; set; }
    public string Currency { get; set; } = "USD";
    public string? Notes { get; set; }
    public string? PaymentMethod { get; set; }
    public DateTime? PaidDate { get; set; }
    public DateTime CreatedUtc { get; set; }
    public DateTime? UpdatedUtc { get; set; }
    public IReadOnlyList<InvoiceLineDto> Lines { get; set; } = Array.Empty<InvoiceLineDto>();
}

public class InvoiceLineDto
{
    public int Id { get; set; }
    public int LineNumber { get; set; }
    public string Description { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Amount { get; set; }
}

public class CreateInvoiceLineDto
{
    public int LineNumber { get; set; }

    [Required, MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    [Range(0, int.MaxValue)]
    public int Quantity { get; set; }

    [Range(typeof(decimal), "0", "79228162514264337593543950335")]
    public decimal UnitPrice { get; set; }
}

public class CreateInvoiceDto
{
    [MaxLength(64)]
    public string? InvoiceNumber { get; set; }

    [Required]
    public DateTime IssueDate { get; set; }

    [Required]
    public DateTime DueDate { get; set; }

    [Required, MaxLength(200)]
    public string ClientName { get; set; } = string.Empty;

    [MaxLength(256)]
    public string? ClientEmail { get; set; }

    [MaxLength(500)]
    public string? ClientAddress { get; set; }

    [MaxLength(20)]
    public string? Status { get; set; }

    [Range(0, 100)]
    public decimal TaxRatePercent { get; set; }

    [MaxLength(100)]
    public string? Terms { get; set; }

    [MaxLength(10)]
    public string? Currency { get; set; }

    [MaxLength(2000)]
    public string? Notes { get; set; }

    [MinLength(1)]
    public List<CreateInvoiceLineDto> Lines { get; set; } = new();
}

public class UpdateInvoiceDto : CreateInvoiceDto
{
    [MaxLength(64)]
    public string? PaymentMethod { get; set; }

    public DateTime? PaidDate { get; set; }
}
