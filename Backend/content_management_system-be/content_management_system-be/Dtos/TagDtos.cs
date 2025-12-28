namespace CMS.DTOs
{
    public class TagCreateDto
    {
        public string Name { get; set; }
    }

    public class TagUpdateDto
    {
        public string Name { get; set; }
    }

    public class TagReadDto
    {
        public int TagId { get; set; }
        public string Name { get; set; }
        public string Slug { get; set; }
    }
}
