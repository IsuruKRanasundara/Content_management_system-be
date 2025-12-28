using CMS.DTOs;

namespace CMS.Services.Interfaces
{
    public interface IMediaService
    {
        Task<IEnumerable<MediaReadDto>> GetAllAsync();
        Task<MediaReadDto?> GetByIdAsync(int id);
        Task<MediaReadDto> CreateAsync(MediaCreateDto dto);
        Task<MediaReadDto?> UpdateAsync(int id, MediaUpdateDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
