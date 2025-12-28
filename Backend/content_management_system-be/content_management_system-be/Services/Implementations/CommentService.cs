using System.Linq;
using AutoMapper;
using CMS.DTOs;
using CMS.Models;
using CMS.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CMS.Services.Implementations
{
    public class CommentService : ICommentService
    {
        private readonly CmsDbContext _context;
        private readonly IMapper _mapper;

        public CommentService(CmsDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<CommentReadDto>> GetAllAsync()
        {
            var comments = await _context.Comments.AsNoTracking().ToListAsync();
            return _mapper.Map<IEnumerable<CommentReadDto>>(comments);
        }

        public async Task<IEnumerable<CommentReadDto>> GetByContentAsync(int contentId)
        {
            var comments = await _context.Comments.AsNoTracking()
                .Where(c => c.ContentId == contentId)
                .ToListAsync();
            return _mapper.Map<IEnumerable<CommentReadDto>>(comments);
        }

        public async Task<CommentReadDto?> GetByIdAsync(int id)
        {
            var comment = await _context.Comments.AsNoTracking()
                .FirstOrDefaultAsync(c => c.CommentId == id);
            return comment == null ? null : _mapper.Map<CommentReadDto>(comment);
        }

        public async Task<CommentReadDto> CreateAsync(CommentCreateDto dto)
        {
            ArgumentNullException.ThrowIfNull(dto);

            var entity = _mapper.Map<Comment>(dto);
            _context.Comments.Add(entity);
            await _context.SaveChangesAsync();

            return _mapper.Map<CommentReadDto>(entity);
        }

        public async Task<CommentReadDto?> UpdateAsync(int id, CommentUpdateDto dto)
        {
            ArgumentNullException.ThrowIfNull(dto);

            var entity = await _context.Comments.FindAsync(id);
            if (entity == null)
            {
                return null;
            }

            if (!string.IsNullOrWhiteSpace(dto.Text))
            {
                entity.Text = dto.Text;
            }

            if (dto.IsApproved.HasValue)
            {
                entity.IsApproved = dto.IsApproved.Value;
            }

            entity.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return _mapper.Map<CommentReadDto>(entity);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.Comments.FindAsync(id);
            if (entity == null)
            {
                return false;
            }

            _context.Comments.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
