using CMS.DTOs;

namespace CMS.Services.Interfaces
{
    public interface IContentService
    {
        Task<IEnumerable<ContentReadDto>> GetAllAsync();
        Task<ContentReadDto?> GetByIdAsync(int id);
        Task<ContentReadDto> CreateAsync(ContentCreateDto dto);
        Task<ContentReadDto?> UpdateAsync(int id, ContentCreateDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
