using System;
using System.Text;
using AutoMapper;
using CMS.DTOs;
using CMS.Models;
using CMS.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CMS.Services.Implementations
{
    public class TagService : ITagService
    {
        private readonly CmsDbContext _context;
        private readonly IMapper _mapper;

        public TagService(CmsDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<TagReadDto>> GetAllAsync()
        {
            var tags = await _context.Tags.AsNoTracking().ToListAsync();
            return _mapper.Map<IEnumerable<TagReadDto>>(tags);
        }

        public async Task<TagReadDto?> GetByIdAsync(int id)
        {
            var tag = await _context.Tags.AsNoTracking().FirstOrDefaultAsync(t => t.TagId == id);
            return tag == null ? null : _mapper.Map<TagReadDto>(tag);
        }

        public async Task<TagReadDto> CreateAsync(TagCreateDto dto)
        {
            ArgumentNullException.ThrowIfNull(dto);

            var normalizedName = dto.Name?.Trim();
            if (string.IsNullOrWhiteSpace(normalizedName))
            {
                throw new ArgumentException("Tag name is required.", nameof(dto));
            }

            if (await _context.Tags.AnyAsync(t => t.Name == normalizedName))
            {
                throw new InvalidOperationException("Tag with the same name already exists.");
            }

            var entity = _mapper.Map<Tag>(dto);
            entity.Name = normalizedName;
            entity.Slug = GenerateSlug(normalizedName);

            _context.Tags.Add(entity);
            await _context.SaveChangesAsync();

            return _mapper.Map<TagReadDto>(entity);
        }

        public async Task<TagReadDto?> UpdateAsync(int id, TagUpdateDto dto)
        {
            ArgumentNullException.ThrowIfNull(dto);

            var entity = await _context.Tags.FindAsync(id);
            if (entity == null)
            {
                return null;
            }

            var normalizedName = dto.Name?.Trim();
            if (!string.IsNullOrWhiteSpace(normalizedName) && !string.Equals(entity.Name, normalizedName, StringComparison.Ordinal))
            {
                if (await _context.Tags.AnyAsync(t => t.Name == normalizedName && t.TagId != id))
                {
                    throw new InvalidOperationException("Tag with the same name already exists.");
                }

                entity.Name = normalizedName;
                entity.Slug = GenerateSlug(normalizedName);
            }

            await _context.SaveChangesAsync();
            return _mapper.Map<TagReadDto>(entity);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.Tags.FindAsync(id);
            if (entity == null)
            {
                return false;
            }

            _context.Tags.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        private static string GenerateSlug(string value)
        {
            var builder = new StringBuilder();
            foreach (var character in value.ToLowerInvariant())
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
            return string.IsNullOrWhiteSpace(slug) ? Guid.NewGuid().ToString("N") : slug;
        }
    }
}
