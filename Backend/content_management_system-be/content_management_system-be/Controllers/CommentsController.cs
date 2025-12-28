using CMS.DTOs;
using CMS.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CMS.Controllers
{
    [ApiController]
    [Route("api/comments")]
    [Authorize]
    public class CommentsController : ControllerBase
    {
        private readonly ICommentService _commentService;

        public CommentsController(ICommentService commentService)
        {
            _commentService = commentService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var comments = await _commentService.GetAllAsync();
            return Ok(comments);
        }

        [HttpGet("content/{contentId:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetByContent(int contentId)
        {
            var comments = await _commentService.GetByContentAsync(contentId);
            return Ok(comments);
        }

        [HttpGet("{id:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> Get(int id)
        {
            var comment = await _commentService.GetByIdAsync(id);
            return comment == null ? NotFound() : Ok(comment);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CommentCreateDto dto)
        {
            var created = await _commentService.CreateAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = created.CommentId }, created);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, CommentUpdateDto dto)
        {
            var updated = await _commentService.UpdateAsync(id, dto);
            return updated == null ? NotFound() : Ok(updated);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _commentService.DeleteAsync(id);
            return deleted ? NoContent() : NotFound();
        }
    }
}
