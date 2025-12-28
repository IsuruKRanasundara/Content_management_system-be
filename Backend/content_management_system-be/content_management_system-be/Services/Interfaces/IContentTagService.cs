using CMS.DTOs;

namespace CMS.Services.Interfaces
{
    public interface IContentTagService
    {
        Task<IEnumerable<ContentTagReadDto>> GetAllAsync();
        Task<IEnumerable<ContentTagReadDto>> GetByContentAsync(int contentId);
        Task<ContentTagReadDto?> GetAsync(int contentId, int tagId);
        Task<ContentTagReadDto> AddAsync(ContentTagCreateDto dto);
        Task<bool> RemoveAsync(int contentId, int tagId);
    }
}
