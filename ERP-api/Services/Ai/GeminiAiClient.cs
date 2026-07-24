using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ErpApi.Services.Ai;

public interface IGeminiAiClient
{
    bool IsConfigured { get; }
    Task<string> GenerateTextAsync(string prompt, CancellationToken ct = default);
    Task<T?> GenerateJsonAsync<T>(string prompt, CancellationToken ct = default);
}

public sealed class GeminiAiClient : IGeminiAiClient
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    private readonly HttpClient _http;
    private readonly IConfiguration _config;
    private readonly ILogger<GeminiAiClient> _logger;

    public GeminiAiClient(HttpClient http, IConfiguration config, ILogger<GeminiAiClient> logger)
    {
        _http = http;
        _config = config;
        _logger = logger;
    }

    public bool IsConfigured => !string.IsNullOrWhiteSpace(ApiKey);

    private string? ApiKey =>
        (_config["Gemini:ApiKey"] ?? _config["GEMINI_API_KEY"] ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY"))
            ?.Trim();

    private string Model =>
        string.IsNullOrWhiteSpace(_config["Gemini:Model"])
            ? "gemini-3.6-flash"
            : _config["Gemini:Model"]!.Trim();

    public async Task<string> GenerateTextAsync(string prompt, CancellationToken ct = default)
    {
        var text = await CallAsync(prompt, jsonMode: false, ct);
        return string.IsNullOrWhiteSpace(text)
            ? "Sorry, I could not generate a response."
            : text.Trim();
    }

    public async Task<T?> GenerateJsonAsync<T>(string prompt, CancellationToken ct = default)
    {
        var text = await CallAsync(prompt, jsonMode: true, ct);
        if (string.IsNullOrWhiteSpace(text)) return default;

        var cleaned = StripMarkdownFence(text);
        try
        {
            return JsonSerializer.Deserialize<T>(cleaned, JsonOptions);
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Failed to deserialize Gemini JSON response");
            return default;
        }
    }

    private async Task<string?> CallAsync(string prompt, bool jsonMode, CancellationToken ct)
    {
        var key = ApiKey;
        if (string.IsNullOrWhiteSpace(key))
            throw new InvalidOperationException("Gemini is not configured. Set Gemini:ApiKey or GEMINI_API_KEY.");

        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{Model}:generateContent?key={Uri.EscapeDataString(key)}";

        var body = new GeminiRequest
        {
            Contents =
            [
                new GeminiContent
                {
                    Parts = [new GeminiPart { Text = prompt }]
                }
            ],
            GenerationConfig = jsonMode
                ? new GeminiGenerationConfig { ResponseMimeType = "application/json" }
                : null
        };

        using var response = await _http.PostAsJsonAsync(url, body, JsonOptions, ct);
        var payload = await response.Content.ReadFromJsonAsync<GeminiResponse>(JsonOptions, ct);

        if (!response.IsSuccessStatusCode)
        {
            var err = payload?.Error?.Message ?? response.ReasonPhrase ?? "Gemini request failed";
            _logger.LogWarning("Gemini HTTP {Status}: {Error}", (int)response.StatusCode, err);
            throw new InvalidOperationException(err);
        }

        return payload?.Candidates?
            .SelectMany(c => c.Content?.Parts ?? [])
            .Select(p => p.Text)
            .FirstOrDefault(t => !string.IsNullOrWhiteSpace(t));
    }

    private static string StripMarkdownFence(string text)
    {
        var t = text.Trim();
        if (!t.StartsWith("```", StringComparison.Ordinal)) return t;
        var firstNl = t.IndexOf('\n');
        if (firstNl < 0) return t;
        t = t[(firstNl + 1)..];
        var fence = t.LastIndexOf("```", StringComparison.Ordinal);
        if (fence >= 0) t = t[..fence];
        return t.Trim();
    }

    private sealed class GeminiRequest
    {
        [JsonPropertyName("contents")]
        public List<GeminiContent> Contents { get; set; } = [];

        [JsonPropertyName("generationConfig")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public GeminiGenerationConfig? GenerationConfig { get; set; }
    }

    private sealed class GeminiContent
    {
        [JsonPropertyName("parts")]
        public List<GeminiPart> Parts { get; set; } = [];
    }

    private sealed class GeminiPart
    {
        [JsonPropertyName("text")]
        public string Text { get; set; } = string.Empty;
    }

    private sealed class GeminiGenerationConfig
    {
        [JsonPropertyName("responseMimeType")]
        public string ResponseMimeType { get; set; } = "application/json";
    }

    private sealed class GeminiResponse
    {
        [JsonPropertyName("candidates")]
        public List<GeminiCandidate>? Candidates { get; set; }

        [JsonPropertyName("error")]
        public GeminiError? Error { get; set; }
    }

    private sealed class GeminiCandidate
    {
        [JsonPropertyName("content")]
        public GeminiContent? Content { get; set; }
    }

    private sealed class GeminiError
    {
        [JsonPropertyName("message")]
        public string? Message { get; set; }
    }
}
