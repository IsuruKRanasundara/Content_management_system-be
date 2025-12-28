using AutoMapper;
using CMS.DTOs;
using CMS.Models;
using CMS.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CMS.Services.Implementations
{
    public class MediaService : IMediaService
    {
        private readonly CmsDbContext _context;
        private readonly IMapper _mapper;

        public MediaService(CmsDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<MediaReadDto>> GetAllAsync()
        {
            var mediaFiles = await _context.Media.AsNoTracking().ToListAsync();
            return _mapper.Map<IEnumerable<MediaReadDto>>(mediaFiles);
        }

        public async Task<MediaReadDto?> GetByIdAsync(int id)
        {
            var media = await _context.Media.AsNoTracking().FirstOrDefaultAsync(m => m.MediaId == id);
            return media == null ? null : _mapper.Map<MediaReadDto>(media);
        }

        public async Task<MediaReadDto> CreateAsync(MediaCreateDto dto)
        {
            ArgumentNullException.ThrowIfNull(dto);

            var entity = _mapper.Map<Media>(dto);
            _context.Media.Add(entity);
            await _context.SaveChangesAsync();

            return _mapper.Map<MediaReadDto>(entity);
        }

        public async Task<MediaReadDto?> UpdateAsync(int id, MediaUpdateDto dto)
        {
            ArgumentNullException.ThrowIfNull(dto);

            var entity = await _context.Media.FindAsync(id);
            if (entity == null)
            {
                return null;
            }

            if (!string.IsNullOrWhiteSpace(dto.FileName))
            {
                entity.FileName = dto.FileName;
            }

            if (!string.IsNullOrWhiteSpace(dto.FileType))
            {
                entity.FileType = dto.FileType;
            }

            if (!string.IsNullOrWhiteSpace(dto.FileUrl))
            {
                entity.FileUrl = dto.FileUrl;
            }

            if (dto.ContentId.HasValue)
            {
                entity.ContentId = dto.ContentId;
            }

            entity.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return _mapper.Map<MediaReadDto>(entity);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.Media.FindAsync(id);
            if (entity == null)
            {
                return false;
            }

            _context.Media.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
