using System.Linq;
using AutoMapper;
using CMS.DTOs;
using CMS.Models;
using CMS.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CMS.Services.Implementations
{
    public class ContentTagService : IContentTagService
    {
        private readonly CmsDbContext _context;
        private readonly IMapper _mapper;

        public ContentTagService(CmsDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<ContentTagReadDto>> GetAllAsync()
        {
            var links = await _context.ContentTags.AsNoTracking().ToListAsync();
            return _mapper.Map<IEnumerable<ContentTagReadDto>>(links);
        }

        public async Task<IEnumerable<ContentTagReadDto>> GetByContentAsync(int contentId)
        {
            var links = await _context.ContentTags.AsNoTracking()
                .Where(ct => ct.ContentId == contentId)
                .ToListAsync();
            return _mapper.Map<IEnumerable<ContentTagReadDto>>(links);
        }

        public async Task<ContentTagReadDto?> GetAsync(int contentId, int tagId)
        {
            var link = await _context.ContentTags.AsNoTracking()
                .FirstOrDefaultAsync(ct => ct.ContentId == contentId && ct.TagId == tagId);
            return link == null ? null : _mapper.Map<ContentTagReadDto>(link);
        }

        public async Task<ContentTagReadDto> AddAsync(ContentTagCreateDto dto)
        {
            ArgumentNullException.ThrowIfNull(dto);

            var existing = await _context.ContentTags.FindAsync(dto.ContentId, dto.TagId);
            if (existing != null)
            {
                throw new InvalidOperationException("Content already has this tag.");
            }

            var entity = _mapper.Map<ContentTag>(dto);
            _context.ContentTags.Add(entity);
            await _context.SaveChangesAsync();

            return _mapper.Map<ContentTagReadDto>(entity);
        }

        public async Task<bool> RemoveAsync(int contentId, int tagId)
        {
            var entity = await _context.ContentTags.FindAsync(contentId, tagId);
            if (entity == null)
            {
                return false;
            }

            _context.ContentTags.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
