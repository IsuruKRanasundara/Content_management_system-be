using CMS.DTOs;
using CMS.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CMS.Controllers
{
    [ApiController]
    [Route("api/tags")]
    [Authorize(Roles = "Admin")]
    public class TagsController : ControllerBase
    {
        private readonly ITagService _tagService;

        public TagsController(ITagService tagService)
        {
            _tagService = tagService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var tags = await _tagService.GetAllAsync();
            return Ok(tags);
        }

        [HttpGet("{id:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> Get(int id)
        {
            var tag = await _tagService.GetByIdAsync(id);
            return tag == null ? NotFound() : Ok(tag);
        }

        [HttpPost]
        public async Task<IActionResult> Create(TagCreateDto dto)
        {
            try
            {
                var created = await _tagService.CreateAsync(dto);
                return CreatedAtAction(nameof(Get), new { id = created.TagId }, created);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, TagUpdateDto dto)
        {
            try
            {
                var updated = await _tagService.UpdateAsync(id, dto);
                return updated == null ? NotFound() : Ok(updated);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _tagService.DeleteAsync(id);
            return deleted ? NoContent() : NotFound();
        }
    }
}
