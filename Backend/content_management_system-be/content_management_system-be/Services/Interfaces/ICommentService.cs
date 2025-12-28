using CMS.DTOs;

namespace CMS.Services.Interfaces
{
    public interface ICommentService
    {
        Task<IEnumerable<CommentReadDto>> GetAllAsync();
        Task<IEnumerable<CommentReadDto>> GetByContentAsync(int contentId);
        Task<CommentReadDto?> GetByIdAsync(int id);
        Task<CommentReadDto> CreateAsync(CommentCreateDto dto);
        Task<CommentReadDto?> UpdateAsync(int id, CommentUpdateDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
