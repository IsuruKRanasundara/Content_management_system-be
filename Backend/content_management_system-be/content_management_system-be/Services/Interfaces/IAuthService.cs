using CMS.DTOs;

namespace CMS.Services.Interfaces
{
    public interface IAuthService
    {
        Task<UserReadDto> RegisterAsync(RegisterUserDto dto);
        Task<AuthResponseDto> LoginAsync(LoginUserDto dto);
    }
}
