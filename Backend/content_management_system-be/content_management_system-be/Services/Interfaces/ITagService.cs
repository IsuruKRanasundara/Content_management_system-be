using CMS.DTOs;

namespace CMS.Services.Interfaces
{
    public interface ITagService
    {
        Task<IEnumerable<TagReadDto>> GetAllAsync();
        Task<TagReadDto?> GetByIdAsync(int id);
        Task<TagReadDto> CreateAsync(TagCreateDto dto);
        Task<TagReadDto?> UpdateAsync(int id, TagUpdateDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
