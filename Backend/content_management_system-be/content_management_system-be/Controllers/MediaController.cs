using CMS.DTOs;
using CMS.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CMS.Controllers
{
    [ApiController]
    [Route("api/media")]
    [Authorize]
    public class MediaController : ControllerBase
    {
        private readonly IMediaService _mediaService;
        private readonly IWebHostEnvironment _environment;

        public MediaController(IMediaService mediaService, IWebHostEnvironment environment)
        {
            _mediaService = mediaService;
            _environment = environment;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var media = await _mediaService.GetAllAsync();
            return Ok(media);
        }

        [HttpGet("{id:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> Get(int id)
        {
            var item = await _mediaService.GetByIdAsync(id);
            return item == null ? NotFound() : Ok(item);
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadFile([FromForm] IFormFile file, [FromForm] int? userId)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded");
            }

            // Validate file size (10MB max)
            if (file.Length > 10 * 1024 * 1024)
            {
                return BadRequest("File size cannot exceed 10MB");
            }

            // Create uploads directory if it doesn't exist
            var uploadsPath = Path.Combine(_environment.ContentRootPath, "uploads");
            if (!Directory.Exists(uploadsPath))
            {
                Directory.CreateDirectory(uploadsPath);
            }

            // Generate unique filename
            var fileExtension = Path.GetExtension(file.FileName);
            var fileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(uploadsPath, fileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Create media record
            var fileUrl = $"/uploads/{fileName}";
            var mediaDto = new MediaCreateDto
            {
                FileName = file.FileName,
                FileType = file.ContentType,
                FileUrl = fileUrl,
                UploadedBy = userId ?? 0 // Default to 0 if userId is null
            };

            var created = await _mediaService.CreateAsync(mediaDto);
            return Ok(created);
        }

        [HttpPost]
        public async Task<IActionResult> Create(MediaCreateDto dto)
        {
            var created = await _mediaService.CreateAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = created.MediaId }, created);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, MediaUpdateDto dto)
        {
            var updated = await _mediaService.UpdateAsync(id, dto);
            return updated == null ? NotFound() : Ok(updated);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _mediaService.DeleteAsync(id);
            return deleted ? NoContent() : NotFound();
        }
    }
}
