namespace CMS.DTOs
{
    public class CommentCreateDto
    {
        public string Text { get; set; }
        public int ContentId { get; set; }
        public int UserId { get; set; }
        public bool IsApproved { get; set; }
    }

    public class CommentUpdateDto
    {
        public string Text { get; set; }
        public bool? IsApproved { get; set; }
    }

    public class CommentReadDto
    {
        public int CommentId { get; set; }
        public string Text { get; set; }
        public bool IsApproved { get; set; }
        public int ContentId { get; set; }
        public int UserId { get; set; }
    }
}
