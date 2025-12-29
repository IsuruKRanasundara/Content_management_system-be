using System.Security.Claims;
using CMS.DTOs;
using CMS.Models;
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

        [HttpGet("content/{contentId:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetByContent(
            int contentId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var comments = await _commentService.GetByContentAsync(contentId, page, pageSize);
            return Ok(comments);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Get(string id)
        {
            var comment = await _commentService.GetByIdAsync(id);
            return comment == null ? NotFound() : Ok(comment);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CommentCreateDto dto)
        {
            try
            {
                var userContext = BuildUserContext();
                var created = await _commentService.CreateAsync(dto, userContext);
                return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] CommentUpdateDto dto)
        {
            try
            {
                var userContext = BuildUserContext();
                var updated = await _commentService.UpdateAsync(id, dto, userContext);
                return updated == null ? NotFound() : Ok(updated);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                var userContext = BuildUserContext();
                var deleted = await _commentService.SoftDeleteAsync(id, userContext);
                return deleted ? NoContent() : NotFound();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
        }

        private UserContext BuildUserContext()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userIdClaim))
            {
                throw new UnauthorizedAccessException("User identifier missing from token.");
            }

            var username = User.Identity?.Name ?? "unknown";
            var role = User.FindFirstValue(ClaimTypes.Role) ?? "User";

            if (!int.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException("User identifier is invalid.");
            }

            return new UserContext
            {
                UserId = userId,
                Username = username,
                Role = role
            };
        }
    }
}
