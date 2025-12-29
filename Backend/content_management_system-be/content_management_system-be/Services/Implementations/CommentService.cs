using CMS.DTOs;
using CMS.Models;
using CMS.Services.Interfaces;

namespace CMS.Services.Implementations
{
    public class CommentService : ICommentService
    {
        private readonly ICommentRepository _repository;
        private readonly string[] _bannedWords = new[] { "spam", "fake", "scam", "profanity" };

        public CommentService(ICommentRepository repository)
        {
            _repository = repository;
        }

        public async Task<PagedResult<CommentReadDto>> GetByContentAsync(int contentId, int page, int pageSize)
        {
            if (page <= 0) page = 1;
            if (pageSize <= 0 || pageSize > 100) pageSize = 10;

            var (roots, total) = await _repository.GetRootCommentsAsync(contentId, page, pageSize);
            var replies = await _repository.GetRepliesAsync(roots.Select(r => r.Id));

            var replyLookup = replies
                .GroupBy(r => r.ParentId)
                .ToDictionary(g => g.Key!, g => g.Select(MapToReadDto).ToList());

            var mappedRoots = roots
                .Select(root =>
                {
                    var dto = MapToReadDto(root);
                    if (replyLookup.TryGetValue(root.Id, out var children))
                    {
                        dto.Replies = children;
                    }
                    return dto;
                })
                .ToList();

            return new PagedResult<CommentReadDto>
            {
                Items = mappedRoots,
                Page = page,
                PageSize = pageSize,
                Total = total
            };
        }

        public async Task<CommentReadDto?> GetByIdAsync(string id)
        {
            var comment = await _repository.GetByIdAsync(id);
            return comment == null ? null : MapToReadDto(comment);
        }

        public async Task<CommentReadDto> CreateAsync(CommentCreateDto dto, UserContext user)
        {
            ArgumentNullException.ThrowIfNull(dto);
            ArgumentNullException.ThrowIfNull(user);

            ValidateContent(dto.Text);
            await EnsureValidParent(dto.ParentId, dto.ContentId);

            var comment = new CommentDocument
            {
                ContentId = dto.ContentId,
                ParentId = dto.ParentId,
                Text = dto.Text.Trim(),
                UserId = user.UserId,
                Username = user.Username,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _repository.InsertAsync(comment);
            return MapToReadDto(comment);
        }

        public async Task<CommentReadDto?> UpdateAsync(string id, CommentUpdateDto dto, UserContext user)
        {
            ArgumentNullException.ThrowIfNull(dto);
            ArgumentNullException.ThrowIfNull(user);

            var comment = await _repository.GetByIdAsync(id);
            if (comment == null)
            {
                return null;
            }

            if (!IsOwnerOrAdmin(comment, user))
            {
                throw new UnauthorizedAccessException("You can only edit your own comments.");
            }

            if (!string.IsNullOrWhiteSpace(dto.Text))
            {
                ValidateContent(dto.Text);
                comment.Text = dto.Text.Trim();
            }

            if (dto.IsModerated.HasValue)
            {
                if (!user.IsAdmin)
                {
                    throw new UnauthorizedAccessException("Only admins can moderate comments.");
                }
                comment.IsModerated = dto.IsModerated.Value;
            }

            comment.UpdatedAt = DateTime.UtcNow;
            await _repository.UpdateAsync(comment);

            return MapToReadDto(comment);
        }

        public async Task<bool> SoftDeleteAsync(string id, UserContext user)
        {
            ArgumentNullException.ThrowIfNull(user);

            var comment = await _repository.GetByIdAsync(id);
            if (comment == null)
            {
                return false;
            }

            if (!IsOwnerOrAdmin(comment, user))
            {
                throw new UnauthorizedAccessException("You can only delete your own comments.");
            }

            comment.IsDeleted = true;
            comment.Text = "[deleted]";
            comment.UpdatedAt = DateTime.UtcNow;

            await _repository.UpdateAsync(comment);
            return true;
        }

        private async Task EnsureValidParent(string? parentId, int contentId)
        {
            if (string.IsNullOrWhiteSpace(parentId))
            {
                return;
            }

            var parent = await _repository.GetByIdAsync(parentId);
            if (parent == null || parent.ParentId != null || parent.ContentId != contentId)
            {
                throw new InvalidOperationException("Invalid parent comment specified.");
            }
        }

        private void ValidateContent(string text)
        {
            if (string.IsNullOrWhiteSpace(text))
            {
                throw new ArgumentException("Comment text cannot be empty.");
            }

            var lowered = text.ToLowerInvariant();
            if (_bannedWords.Any(b => lowered.Contains(b)))
            {
                throw new InvalidOperationException("Comment blocked by spam/profanity filter.");
            }
        }

        private static bool IsOwnerOrAdmin(CommentDocument comment, UserContext user)
        {
            return user.IsAdmin || comment.UserId == user.UserId;
        }

        private static CommentReadDto MapToReadDto(CommentDocument comment)
        {
            return new CommentReadDto
            {
                Id = comment.Id,
                ContentId = comment.ContentId,
                ParentId = comment.ParentId,
                UserId = comment.UserId,
                Username = comment.Username,
                Text = comment.IsDeleted ? "[deleted]" : comment.Text,
                IsDeleted = comment.IsDeleted,
                IsModerated = comment.IsModerated,
                CreatedAt = comment.CreatedAt,
                UpdatedAt = comment.UpdatedAt,
                Replies = Enumerable.Empty<CommentReadDto>()
            };
        }
    }
}
