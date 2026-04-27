using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using ErpApi;

[ApiController]
[Route("api/projects")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ITenantProvider _tenantProvider;

    public ProjectsController(ApplicationDbContext db, ITenantProvider tenantProvider)
    {
        _db = db;
        _tenantProvider = tenantProvider;
    }
    private int GetCompanyId() => _tenantProvider.CompanyId;


    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProjectDto>>> GetAll()
    {
        var companyId = GetCompanyId();

        var items = await _db.Projects
            .Where(p => p.CompanyId == companyId)
            .OrderByDescending(p => p.CreatedUtc)
            .Select(p => new ProjectDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                StartDate = p.StartDate,
                EndDate = p.EndDate,
                Client = p.Client,
                Manager = p.Manager,
                Status = p.Status,
                Priority = p.Priority,
                Progress = p.Progress,
                Budget = p.Budget,
                Tags = p.Tags,
                CreatedUtc = p.CreatedUtc,
                UpdatedUtc = p.UpdatedUtc
            })
            .ToListAsync();

        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProjectDto>> GetById(int id)
    {
        var companyId = GetCompanyId();

        var p = await _db.Projects
            .Where(x => x.Id == id && x.CompanyId == companyId)
            .Select(x => new ProjectDto
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description,
                StartDate = x.StartDate,
                EndDate = x.EndDate,
                Client = x.Client,
                Manager = x.Manager,
                Status = x.Status,
                Priority = x.Priority,
                Progress = x.Progress,
                Budget = x.Budget,
                Tags = x.Tags,
                CreatedUtc = x.CreatedUtc,
                UpdatedUtc = x.UpdatedUtc
            })
            .FirstOrDefaultAsync();

        if (p == null) return NotFound();
        return Ok(p);
    }

    [HttpPost]
    [Authorize(Policy = Permissions.CreateProjects)]
    public async Task<ActionResult<ProjectDto>> Create([FromBody] CreateProjectDto dto)
    {
        var companyId = GetCompanyId();

        var entity = new Project
        {
            Name = dto.Name.Trim(),
            Description = dto.Description,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            Client = dto.Client?.Trim(),
            Manager = dto.Manager?.Trim(),
            Status = dto.Status?.Trim(),
            Priority = dto.Priority?.Trim(),
            Progress = dto.Progress,
            Budget = dto.Budget,
            Tags = dto.Tags?.Trim(),
            CompanyId = companyId,
            CreatedUtc = DateTime.UtcNow
        };

        _db.Projects.Add(entity);
        await _db.SaveChangesAsync();

        var result = new ProjectDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            StartDate = entity.StartDate,
            EndDate = entity.EndDate,
            Client = entity.Client,
            Manager = entity.Manager,
            Status = entity.Status,
            Priority = entity.Priority,
            Progress = entity.Progress,
            Budget = entity.Budget,
            Tags = entity.Tags,
            CreatedUtc = entity.CreatedUtc,
            UpdatedUtc = entity.UpdatedUtc
        };

        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, result);
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = Permissions.EditProjects)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateProjectDto dto)
    {
        var companyId = GetCompanyId();

        var entity = await _db.Projects.FirstOrDefaultAsync(p => p.Id == id && p.CompanyId == companyId);
        if (entity == null) return NotFound();

        entity.Name = dto.Name.Trim();
        entity.Description = dto.Description;
        entity.StartDate = dto.StartDate;
        entity.EndDate = dto.EndDate;
        entity.Client = dto.Client?.Trim();
        entity.Manager = dto.Manager?.Trim();
        entity.Status = dto.Status?.Trim();
        entity.Priority = dto.Priority?.Trim();
        entity.Progress = dto.Progress;
        entity.Budget = dto.Budget;
        entity.Tags = dto.Tags?.Trim();
        entity.UpdatedUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = Permissions.DeleteProjects)]
    public async Task<IActionResult> Delete(int id)
    {
        var companyId = GetCompanyId();

        var entity = await _db.Projects.FirstOrDefaultAsync(p => p.Id == id && p.CompanyId == companyId);
        if (entity == null) return NotFound();

        _db.Projects.Remove(entity);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

public class ProjectDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Client { get; set; }
    public string? Manager { get; set; }
    public string? Status { get; set; }
    public string? Priority { get; set; }
    public int Progress { get; set; }
    public decimal? Budget { get; set; }
    public string? Tags { get; set; }
    public DateTime CreatedUtc { get; set; }
    public DateTime? UpdatedUtc { get; set; }
}

public class CreateProjectDto
{
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

    [Range(0, 100)]
    public int Progress { get; set; }

    public decimal? Budget { get; set; }

    [MaxLength(500)]
    public string? Tags { get; set; }
}

public class UpdateProjectDto
{
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

    [Range(0, 100)]
    public int Progress { get; set; }

    public decimal? Budget { get; set; }

    [MaxLength(500)]
    public string? Tags { get; set; }
}