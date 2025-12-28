using CMS.DTOs;

namespace CMS.Services.Interfaces
{
    public interface IUserService
    {
        Task<List<UserReadDto>> GetAllUsersAsync();
        Task<UserReadDto> GetUserByIdAsync(int id);
        Task<UserReadDto> UpdateUserAsync(int id, UserUpdateDto dto);
        Task<bool> DeleteUserAsync(int id);
    }
}
