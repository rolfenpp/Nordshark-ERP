using System.ComponentModel.DataAnnotations;
using ErpApi.Services.Ai;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ErpApi;

[RequireTenant]
[ApiController]
[Route("api/ai")]
[Authorize]
public class AiController : TenantApiController
{
    private readonly IAiService _ai;

    public AiController(IAiService ai, ITenantProvider tenantProvider)
        : base(tenantProvider)
    {
        _ai = ai;
    }

    [HttpGet("status")]
    public ActionResult<object> Status() =>
        Ok(new { configured = _ai.IsConfigured, companyId = CompanyId });

    [HttpPost("help")]
    public async Task<ActionResult<AiHelpResponse>> Help([FromBody] AiHelpRequestDto? dto, CancellationToken ct)
    {
        if (dto is null) return BadRequest("Request body is required.");
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var result = await _ai.HelpAsync(User, new AiHelpRequest
        {
            Question = dto.Question,
            CurrentRoute = dto.CurrentRoute
        }, ct);
        return Ok(result);
    }

    [HttpGet("brief")]
    public async Task<ActionResult<AiBriefResponse>> Brief(CancellationToken ct)
    {
        var result = await _ai.BriefAsync(User, ct);
        return Ok(result);
    }

    [HttpPost("drafts/invoice")]
    [Authorize(Policy = Permissions.CreateInvoices)]
    public async Task<ActionResult<AiInvoiceDraftResponse>> DraftInvoice(
        [FromBody] AiInvoiceDraftRequestDto? dto,
        CancellationToken ct)
    {
        if (dto is null) return BadRequest("Request body is required.");
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var result = await _ai.DraftInvoiceAsync(User, new AiInvoiceDraftRequest { Text = dto.Text }, ct);
        if (!result.Ok && result.Error is not null && result.Error.Contains("not configured", StringComparison.OrdinalIgnoreCase))
            return StatusCode(StatusCodes.Status503ServiceUnavailable, result);
        return Ok(result);
    }
}

public sealed class AiHelpRequestDto
{
    [Required, MaxLength(4000)]
    public string Question { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? CurrentRoute { get; set; }
}

public sealed class AiInvoiceDraftRequestDto
{
    [Required, MinLength(8), MaxLength(8000)]
    public string Text { get; set; } = string.Empty;
}
