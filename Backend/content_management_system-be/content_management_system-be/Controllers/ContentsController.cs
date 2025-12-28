using CMS.DTOs;
using CMS.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CMS.Controllers
{
    [ApiController]
    [Route("api/contents")]
    [Authorize]
    public class ContentsController : ControllerBase
    {
        private readonly IContentService _contentService;

        public ContentsController(IContentService contentService)
        {
            _contentService = contentService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var contents = await _contentService.GetAllAsync();
            return Ok(contents);
        }

        [HttpGet("{id:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> Get(int id)
        {
            var content = await _contentService.GetByIdAsync(id);
            return content == null ? NotFound() : Ok(content);
        }

        [HttpPost]
        public async Task<IActionResult> Create(ContentCreateDto dto)
        {
            var created = await _contentService.CreateAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = created.ContentId }, created);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, ContentCreateDto dto)
        {
            var updated = await _contentService.UpdateAsync(id, dto);
            return updated == null ? NotFound() : Ok(updated);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _contentService.DeleteAsync(id);
            return deleted ? NoContent() : NotFound();
        }
    }
}
