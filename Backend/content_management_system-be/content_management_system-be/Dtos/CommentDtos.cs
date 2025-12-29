namespace CMS.DTOs
{
    public class CommentCreateDto
    {
        public string Text { get; set; }
        public int ContentId { get; set; }
        public string? ParentId { get; set; }
    }

    public class CommentUpdateDto
    {
        public string Text { get; set; }
        public bool? IsModerated { get; set; }
    }

    public class CommentReadDto
    {
        public string Id { get; set; }
        public int ContentId { get; set; }
        public string? ParentId { get; set; }
        public int UserId { get; set; }
        public string Username { get; set; }
        public string Text { get; set; }
        public bool IsDeleted { get; set; }
        public bool IsModerated { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public IEnumerable<CommentReadDto> Replies { get; set; } = Enumerable.Empty<CommentReadDto>();
    }

    public class PagedResult<T>
    {
        public IEnumerable<T> Items { get; set; } = Enumerable.Empty<T>();
        public int Page { get; set; }
        public int PageSize { get; set; }
        public long Total { get; set; }
    }
}
