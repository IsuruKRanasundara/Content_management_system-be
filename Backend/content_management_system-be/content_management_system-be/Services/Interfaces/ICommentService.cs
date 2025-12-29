using CMS.DTOs;
using CMS.Models;

namespace CMS.Services.Interfaces
{
    public interface ICommentService
    {
        Task<PagedResult<CommentReadDto>> GetByContentAsync(int contentId, int page, int pageSize);
        Task<CommentReadDto?> GetByIdAsync(string id);
        Task<CommentReadDto> CreateAsync(CommentCreateDto dto, UserContext user);
        Task<CommentReadDto?> UpdateAsync(string id, CommentUpdateDto dto, UserContext user);
        Task<bool> SoftDeleteAsync(string id, UserContext user);
    }
}
