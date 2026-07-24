using System.Globalization;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;

namespace ErpApi.Services.Ai;

public interface IAiService
{
    bool IsConfigured { get; }
    Task<AiHelpResponse> HelpAsync(ClaimsPrincipal user, AiHelpRequest request, CancellationToken ct = default);
    Task<AiBriefResponse> BriefAsync(ClaimsPrincipal user, CancellationToken ct = default);
    Task<AiInvoiceDraftResponse> DraftInvoiceAsync(ClaimsPrincipal user, AiInvoiceDraftRequest request, CancellationToken ct = default);
}

public sealed class AiService : IAiService
{
    private readonly ApplicationDbContext _db;
    private readonly IGeminiAiClient _gemini;
    private readonly ILogger<AiService> _logger;

    public AiService(ApplicationDbContext db, IGeminiAiClient gemini, ILogger<AiService> logger)
    {
        _db = db;
        _gemini = gemini;
        _logger = logger;
    }

    public bool IsConfigured => _gemini.IsConfigured;

    public async Task<AiHelpResponse> HelpAsync(ClaimsPrincipal user, AiHelpRequest request, CancellationToken ct = default)
    {
        var question = (request.Question ?? string.Empty).Trim();
        if (string.IsNullOrEmpty(question))
            return new AiHelpResponse { Answer = "Ask a short question about navigating Nordshark ERP." };

        var route = string.IsNullOrWhiteSpace(request.CurrentRoute) ? "/" : request.CurrentRoute.Trim();
        var actions = SuggestActions(route);

        if (!_gemini.IsConfigured)
        {
            return new AiHelpResponse
            {
                Answer =
                    "AI is not configured on the API. Set Gemini:ApiKey (or GEMINI_API_KEY) on the server, then restart. " +
                    "Meanwhile: use the sidebar for Dashboard, Inventory, Invoices, Projects, and Users.",
                SuggestedActions = actions,
                Configured = false
            };
        }

        var prompt = $"""
You are Nordshark ERP's navigation assistant for a demo product.

PRODUCT TRUTH (do not invent features):
{AiHelpKnowledge.ProductTruth}

CURRENT ROUTE: {route}
USER PERMISSIONS SUMMARY: {PermissionSummary(user)}

USER QUESTION: {question}

Rules:
1. Only describe features that exist in PRODUCT TRUTH.
2. Use numbered steps and put UI labels in "quotes".
3. Keep under 180 words.
4. If they ask for CSV import, PDF/email send, tasks, or time tracking — say it is not built yet and suggest the closest real screen.
5. End with one short tip.
""";

        try
        {
            var answer = await _gemini.GenerateTextAsync(prompt, ct);
            return new AiHelpResponse
            {
                Answer = answer,
                SuggestedActions = actions,
                Configured = true
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Gemini help failed");
            return new AiHelpResponse
            {
                Answer = "The AI provider failed just now. Use the sidebar: Dashboard, Inventory, Invoices, Projects, Users. Real features only — no CSV import, PDF send, or project tasks in this demo.",
                SuggestedActions = actions,
                Configured = true
            };
        }
    }

    public async Task<AiBriefResponse> BriefAsync(ClaimsPrincipal user, CancellationToken ct = default)
    {
        var canInvoices = Can(user, Permissions.ViewInvoices);
        var canInventory = Can(user, Permissions.ViewInventory);
        var canProjects = Can(user, Permissions.ViewProjects);

        var facts = new List<AiBriefFact>();
        var highlights = new List<string>();

        InvoiceBriefSlice? invoices = null;
        InventoryBriefSlice? inventory = null;
        ProjectBriefSlice? projects = null;

        if (canInvoices)
        {
            var list = await _db.Invoices.AsNoTracking()
                .Select(i => new { i.Id, i.InvoiceNumber, i.Status, i.Total, i.DueDate, i.ClientName })
                .ToListAsync(ct);

            var today = DateTime.UtcNow.Date;
            var overdue = list.Where(i =>
            {
                var s = (i.Status ?? "").Trim().ToLowerInvariant();
                if (s == "overdue") return true;
                if (s is "paid" or "draft") return false;
                return i.DueDate.Date < today;
            }).ToList();

            var pending = list.Count(i =>
            {
                var s = (i.Status ?? "").Trim().ToLowerInvariant();
                return s is "pending" or "overdue" || (s != "paid" && s != "draft" && i.DueDate.Date < today);
            });

            var outstanding = list
                .Where(i =>
                {
                    var s = (i.Status ?? "").Trim().ToLowerInvariant();
                    return s != "paid";
                })
                .Sum(i => i.Total);

            invoices = new InvoiceBriefSlice
            {
                TotalCount = list.Count,
                OverdueCount = overdue.Count,
                PendingOrOverdueCount = pending,
                OutstandingTotal = outstanding,
                OverdueExamples = overdue
                    .OrderBy(i => i.DueDate)
                    .Take(5)
                    .Select(i => $"{i.InvoiceNumber} · {i.ClientName} · {i.Total.ToString("0.00", CultureInfo.InvariantCulture)}")
                    .ToList()
            };

            facts.Add(new AiBriefFact("Overdue invoices", invoices.OverdueCount.ToString(), "invoice"));
            facts.Add(new AiBriefFact("Outstanding total", outstanding.ToString("0.00", CultureInfo.InvariantCulture), "invoice"));
            if (overdue.Count > 0)
                highlights.Add($"{overdue.Count} invoice(s) need attention (overdue by status or past due date).");
        }

        if (canInventory)
        {
            var items = await _db.InventoryItems.AsNoTracking()
                .Select(i => new { i.Id, i.Sku, i.Name, i.QuantityOnHand, i.ReorderLevel, i.UnitPrice })
                .ToListAsync(ct);

            var outOfStock = items.Where(i => i.QuantityOnHand <= 0).ToList();
            var low = items.Where(i =>
                    i.QuantityOnHand > 0 &&
                    i.ReorderLevel is > 0 &&
                    i.QuantityOnHand <= i.ReorderLevel.Value)
                .ToList();

            var stockValue = items.Sum(i => i.QuantityOnHand * i.UnitPrice);

            inventory = new InventoryBriefSlice
            {
                ItemCount = items.Count,
                OutOfStockCount = outOfStock.Count,
                LowStockCount = low.Count,
                StockValue = stockValue,
                Exceptions = outOfStock.Concat(low)
                    .OrderBy(i => i.QuantityOnHand)
                    .Take(8)
                    .Select(i => $"{(string.IsNullOrWhiteSpace(i.Sku) ? i.Name : i.Sku)} · qty {i.QuantityOnHand}" +
                                 (i.ReorderLevel is > 0 ? $" (reorder {i.ReorderLevel})" : ""))
                    .ToList()
            };

            facts.Add(new AiBriefFact("Low stock", low.Count.ToString(), "inventory"));
            facts.Add(new AiBriefFact("Out of stock", outOfStock.Count.ToString(), "inventory"));
            if (outOfStock.Count + low.Count > 0)
                highlights.Add($"{outOfStock.Count + low.Count} inventory item(s) are out or at/below reorder level.");
        }

        if (canProjects)
        {
            var list = await _db.Projects.AsNoTracking()
                .Select(p => new { p.Id, p.Name, p.Status, p.Priority, p.Progress, p.EndDate, p.Manager })
                .ToListAsync(ct);

            var today = DateTime.UtcNow.Date;
            var slipping = list.Where(p =>
            {
                var status = (p.Status ?? "").Trim().ToLowerInvariant();
                if (status is "completed") return false;
                return p.EndDate is { } end && end.Date < today && p.Progress < 100;
            }).ToList();

            var urgent = list.Count(p =>
            {
                var pr = (p.Priority ?? "").Trim().ToLowerInvariant();
                var st = (p.Status ?? "").Trim().ToLowerInvariant();
                return (pr is "urgent" or "high") && st is not "completed";
            });

            projects = new ProjectBriefSlice
            {
                TotalCount = list.Count,
                SlippingCount = slipping.Count,
                HighPriorityOpenCount = urgent,
                Examples = slipping
                    .Take(5)
                    .Select(p => $"{p.Name} · {p.Progress}% · end {p.EndDate:yyyy-MM-dd}")
                    .ToList()
            };

            facts.Add(new AiBriefFact("Projects past end date", slipping.Count.ToString(), "project"));
            if (slipping.Count > 0)
                highlights.Add($"{slipping.Count} project(s) are past end date and not at 100% progress.");
        }

        var templateNarrative = BuildTemplateNarrative(highlights, canInvoices, canInventory, canProjects);
        string narrative = templateNarrative;

        if (_gemini.IsConfigured && facts.Count > 0)
        {
            try
            {
                var prompt = $"""
Write a crisp operations brief (max 90 words) for a Nordshark ERP demo dashboard.
Use ONLY these facts. Do not invent numbers or features.

FACTS:
{string.Join("\n", facts.Select(f => $"- {f.Label}: {f.Value}"))}

HIGHLIGHTS:
{(highlights.Count == 0 ? "- Nothing urgent." : string.Join("\n", highlights.Select(h => $"- {h}")))}

Tone: direct, practical, no fluff, no emojis.
""";
                narrative = await _gemini.GenerateTextAsync(prompt, ct);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Gemini narrative failed; using template brief");
                narrative = templateNarrative;
            }
        }

        return new AiBriefResponse
        {
            AsOfUtc = DateTime.UtcNow,
            Narrative = narrative,
            Facts = facts,
            Invoices = invoices,
            Inventory = inventory,
            Projects = projects,
            Configured = _gemini.IsConfigured,
            Limitations =
            [
                "Invoice 'overdue' uses stored status or past due date when not paid/draft.",
                "Stock exceptions use quantity vs reorder level only (no demand history).",
                "Project 'slipping' means end date passed and progress < 100."
            ]
        };
    }

    public async Task<AiInvoiceDraftResponse> DraftInvoiceAsync(
        ClaimsPrincipal user,
        AiInvoiceDraftRequest request,
        CancellationToken ct = default)
    {
        var text = (request.Text ?? string.Empty).Trim();
        if (text.Length < 8)
        {
            return new AiInvoiceDraftResponse
            {
                Ok = false,
                Error = "Paste a short invoice brief (client, lines, amounts, terms)."
            };
        }

        if (!_gemini.IsConfigured)
        {
            return new AiInvoiceDraftResponse
            {
                Ok = false,
                Error = "AI is not configured on the API. Set Gemini:ApiKey or GEMINI_API_KEY."
            };
        }

        var inventoryHint = "";
        if (Can(user, Permissions.ViewInventory))
        {
            var items = await _db.InventoryItems.AsNoTracking()
                .OrderBy(i => i.Name)
                .Take(40)
                .Select(i => new { i.Sku, i.Name, i.UnitPrice })
                .ToListAsync(ct);

            if (items.Count > 0)
            {
                var sb = new StringBuilder();
                sb.AppendLine("Optional inventory catalog (prefer matching these names/SKUs and unit prices when relevant):");
                foreach (var i in items)
                {
                    sb.AppendLine($"- SKU={i.Sku}; Name={i.Name}; UnitPrice={i.UnitPrice.ToString(CultureInfo.InvariantCulture)}");
                }
                inventoryHint = sb.ToString();
            }
        }

        var today = DateTime.UtcNow.Date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
        const string schema = """
{
  "clientName": string|null,
  "clientEmail": string|null,
  "clientAddress": string|null,
  "issueDate": "YYYY-MM-DD"|null,
  "dueDate": "YYYY-MM-DD"|null,
  "currency": string|null,
  "terms": string|null,
  "taxRatePercent": number|null,
  "notes": string|null,
  "lines": [{ "description": string, "quantity": number, "unitPrice": number }],
  "warnings": [string],
  "assumptions": [string]
}
""";

        var prompt =
            "Extract an invoice draft from the user brief. Return JSON only matching this schema:\n" +
            schema +
            "\nRules:\n" +
            $"- Today is {today}.\n" +
            "- If due date missing and terms say Net N, set dueDate = issueDate + N days (issueDate defaults to today).\n" +
            "- quantity must be > 0; unitPrice >= 0.\n" +
            "- Do not invent a client if none is implied; leave clientName null and warn.\n" +
            "- Prefer catalog unit prices when a line clearly matches inventory.\n" +
            "- Put uncertainty in warnings/assumptions; never invent tax law advice.\n" +
            "- At least one line if any amount/work is mentioned.\n\n" +
            inventoryHint +
            "\nUSER BRIEF:\n" +
            text;

        AiInvoiceDraftPayload? draft;
        try
        {
            draft = await _gemini.GenerateJsonAsync<AiInvoiceDraftPayload>(prompt, ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Gemini invoice draft failed");
            return new AiInvoiceDraftResponse
            {
                Ok = false,
                Error = "AI draft failed. Try again or fill the form manually.",
                Configured = true
            };
        }

        if (draft is null)
        {
            return new AiInvoiceDraftResponse
            {
                Ok = false,
                Error = "Could not parse an invoice draft from that brief. Try clearer line items.",
                Configured = true
            };
        }

        draft.Lines ??= [];
        draft.Warnings ??= [];
        draft.Assumptions ??= [];

        draft.Lines = draft.Lines
            .Where(l => !string.IsNullOrWhiteSpace(l.Description))
            .Select((l, i) => new AiInvoiceDraftLine
            {
                Description = l.Description.Trim(),
                Quantity = l.Quantity <= 0 ? 1 : (int)Math.Round(l.Quantity, MidpointRounding.AwayFromZero),
                UnitPrice = l.UnitPrice < 0 ? 0 : l.UnitPrice,
                LineNumber = i + 1
            })
            .ToList();

        if (draft.Lines.Count == 0)
        {
            draft.Warnings.Add("No line items could be extracted.");
        }

        if (string.IsNullOrWhiteSpace(draft.ClientName))
            draft.Warnings.Add("Client name was not found — fill it in before saving.");

        if (draft.TaxRatePercent is < 0 or > 100)
            draft.TaxRatePercent = null;

        return new AiInvoiceDraftResponse
        {
            Ok = true,
            Draft = draft,
            Configured = true
        };
    }

    private static bool Can(ClaimsPrincipal user, string perm) =>
        user.IsInRole("Admin") || user.HasClaim("perm", perm);

    private static string PermissionSummary(ClaimsPrincipal user)
    {
        if (user.IsInRole("Admin")) return "Admin (full access)";
        var perms = user.FindAll("perm").Select(c => c.Value).Distinct().OrderBy(x => x).ToArray();
        return perms.Length == 0 ? "User (no extra perm claims)" : string.Join(", ", perms);
    }

    private static List<AiSuggestedAction> SuggestActions(string route)
    {
        var r = route.ToLowerInvariant();
        if (r.Contains("inventory"))
        {
            return
            [
                new("Inventory list", "/inventory"),
                new("Create item", "/inventory/create"),
            ];
        }
        if (r.Contains("invoice"))
        {
            return
            [
                new("Invoices list", "/invoices"),
                new("Create invoice", "/invoices/create"),
            ];
        }
        if (r.Contains("project"))
        {
            return
            [
                new("Projects list", "/projects"),
                new("Create project", "/projects/create"),
            ];
        }
        return
        [
            new("Dashboard", "/dashboard"),
            new("Inventory", "/inventory"),
            new("Invoices", "/invoices"),
            new("Projects", "/projects"),
        ];
    }

    private static string BuildTemplateNarrative(
        List<string> highlights,
        bool canInvoices,
        bool canInventory,
        bool canProjects)
    {
        if (highlights.Count == 0)
        {
            var domains = new List<string>();
            if (canInvoices) domains.Add("invoices");
            if (canInventory) domains.Add("inventory");
            if (canProjects) domains.Add("projects");
            return domains.Count == 0
                ? "No domain view permissions — nothing to summarize."
                : $"No urgent flags across {string.Join(", ", domains)}. Review the dashboard cards for totals.";
        }

        return string.Join(" ", highlights);
    }
}

public sealed class AiHelpRequest
{
    public string Question { get; set; } = string.Empty;
    public string? CurrentRoute { get; set; }
}

public sealed class AiHelpResponse
{
    public string Answer { get; set; } = string.Empty;
    public List<AiSuggestedAction> SuggestedActions { get; set; } = [];
    public bool Configured { get; set; }
}

public sealed record AiSuggestedAction(string Label, string Route);

public sealed class AiBriefResponse
{
    public DateTime AsOfUtc { get; set; }
    public string Narrative { get; set; } = string.Empty;
    public List<AiBriefFact> Facts { get; set; } = [];
    public InvoiceBriefSlice? Invoices { get; set; }
    public InventoryBriefSlice? Inventory { get; set; }
    public ProjectBriefSlice? Projects { get; set; }
    public bool Configured { get; set; }
    public List<string> Limitations { get; set; } = [];
}

public sealed record AiBriefFact(string Label, string Value, string EntityType);

public sealed class InvoiceBriefSlice
{
    public int TotalCount { get; set; }
    public int OverdueCount { get; set; }
    public int PendingOrOverdueCount { get; set; }
    public decimal OutstandingTotal { get; set; }
    public List<string> OverdueExamples { get; set; } = [];
}

public sealed class InventoryBriefSlice
{
    public int ItemCount { get; set; }
    public int OutOfStockCount { get; set; }
    public int LowStockCount { get; set; }
    public decimal StockValue { get; set; }
    public List<string> Exceptions { get; set; } = [];
}

public sealed class ProjectBriefSlice
{
    public int TotalCount { get; set; }
    public int SlippingCount { get; set; }
    public int HighPriorityOpenCount { get; set; }
    public List<string> Examples { get; set; } = [];
}

public sealed class AiInvoiceDraftRequest
{
    public string Text { get; set; } = string.Empty;
}

public sealed class AiInvoiceDraftResponse
{
    public bool Ok { get; set; }
    public string? Error { get; set; }
    public AiInvoiceDraftPayload? Draft { get; set; }
    public bool Configured { get; set; }
}

public sealed class AiInvoiceDraftPayload
{
    public string? ClientName { get; set; }
    public string? ClientEmail { get; set; }
    public string? ClientAddress { get; set; }
    public string? IssueDate { get; set; }
    public string? DueDate { get; set; }
    public string? Currency { get; set; }
    public string? Terms { get; set; }
    public decimal? TaxRatePercent { get; set; }
    public string? Notes { get; set; }
    public List<AiInvoiceDraftLine> Lines { get; set; } = [];
    public List<string> Warnings { get; set; } = [];
    public List<string> Assumptions { get; set; } = [];
}

public sealed class AiInvoiceDraftLine
{
    public int LineNumber { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}
