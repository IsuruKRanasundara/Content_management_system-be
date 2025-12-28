using CMS.DTOs;
using CMS.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CMS.Controllers
{
    [ApiController]
    [Route("api/content-tags")]
    [Authorize(Roles = "Admin")]
    public class ContentTagsController : ControllerBase
    {
        private readonly IContentTagService _contentTagService;

        public ContentTagsController(IContentTagService contentTagService)
        {
            _contentTagService = contentTagService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var links = await _contentTagService.GetAllAsync();
            return Ok(links);
        }

        [HttpGet("content/{contentId:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetByContent(int contentId)
        {
            var links = await _contentTagService.GetByContentAsync(contentId);
            return Ok(links);
        }

        [HttpGet("{contentId:int}/{tagId:int}")]
        public async Task<IActionResult> Get(int contentId, int tagId)
        {
            var link = await _contentTagService.GetAsync(contentId, tagId);
            return link == null ? NotFound() : Ok(link);
        }

        [HttpPost]
        public async Task<IActionResult> Create(ContentTagCreateDto dto)
        {
            try
            {
                var created = await _contentTagService.AddAsync(dto);
                return CreatedAtAction(nameof(Get), new { contentId = created.ContentId, tagId = created.TagId }, created);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpDelete("{contentId:int}/{tagId:int}")]
        public async Task<IActionResult> Delete(int contentId, int tagId)
        {
            var deleted = await _contentTagService.RemoveAsync(contentId, tagId);
            return deleted ? NoContent() : NotFound();
        }
    }
}
