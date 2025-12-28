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

        public MediaController(IMediaService mediaService)
        {
            _mediaService = mediaService;
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
