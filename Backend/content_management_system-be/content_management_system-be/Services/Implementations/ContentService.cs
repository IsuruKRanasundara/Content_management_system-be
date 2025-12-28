using System.Text;
using AutoMapper;
using CMS.DTOs;
using CMS.Models;
using CMS.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CMS.Services.Implementations
{
    public class ContentService : IContentService
    {
        private readonly CmsDbContext _context;
        private readonly IMapper _mapper;

        public ContentService(CmsDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<ContentReadDto>> GetAllAsync()
        {
            var contents = await _context.Contents.AsNoTracking().ToListAsync();
            return _mapper.Map<IEnumerable<ContentReadDto>>(contents);
        }

        public async Task<ContentReadDto?> GetByIdAsync(int id)
        {
            var content = await _context.Contents.AsNoTracking().FirstOrDefaultAsync(c => c.ContentId == id);
            return content == null ? null : _mapper.Map<ContentReadDto>(content);
        }

        public async Task<ContentReadDto> CreateAsync(ContentCreateDto dto)
        {
            ArgumentNullException.ThrowIfNull(dto);

            var entity = _mapper.Map<Content>(dto);
            entity.Slug = GenerateSlug(dto.Title);

            _context.Contents.Add(entity);
            await _context.SaveChangesAsync();

            return _mapper.Map<ContentReadDto>(entity);
        }

        public async Task<ContentReadDto?> UpdateAsync(int id, ContentCreateDto dto)
        {
            ArgumentNullException.ThrowIfNull(dto);

            var entity = await _context.Contents.FindAsync(id);
            if (entity == null)
            {
                return null;
            }

            var titleChanged = !string.Equals(entity.Title, dto.Title, StringComparison.Ordinal);
            if (!string.IsNullOrWhiteSpace(dto.Title))
            {
                entity.Title = dto.Title;
            }

            if (!string.IsNullOrWhiteSpace(dto.Body))
            {
                entity.Body = dto.Body;
            }

            if (dto.CategoryId != 0)
            {
                entity.CategoryId = dto.CategoryId;
            }

            if (titleChanged && !string.IsNullOrWhiteSpace(dto.Title))
            {
                entity.Slug = GenerateSlug(dto.Title);
            }

            entity.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return _mapper.Map<ContentReadDto>(entity);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.Contents.FindAsync(id);
            if (entity == null)
            {
                return false;
            }

            _context.Contents.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        private static string GenerateSlug(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return Guid.NewGuid().ToString("N");
            }

            var builder = new StringBuilder();
            foreach (var character in value.Trim().ToLowerInvariant())
            {
                if (char.IsLetterOrDigit(character))
                {
                    builder.Append(character);
                }
                else if (char.IsWhiteSpace(character) || character == '-' || character == '_')
                {
                    if (builder.Length == 0 || builder[^1] == '-')
                    {
                        continue;
                    }

                    builder.Append('-');
                }
            }

            var slug = builder.ToString().Trim('-');
            return string.IsNullOrEmpty(slug) ? Guid.NewGuid().ToString("N") : slug;
        }
    }
}
