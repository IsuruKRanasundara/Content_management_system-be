using CMS.Models;
using MongoDB.Driver;

namespace CMS.Services.Interfaces
{
    public interface ICommentRepository
    {
        IMongoCollection<CommentDocument> Collection { get; }
        Task<(IReadOnlyList<CommentDocument> roots, long total)> GetRootCommentsAsync(int contentId, int page, int pageSize);
        Task<IReadOnlyList<CommentDocument>> GetRepliesAsync(IEnumerable<string> parentIds);
        Task<CommentDocument?> GetByIdAsync(string id);
        Task InsertAsync(CommentDocument comment);
        Task UpdateAsync(CommentDocument comment);
    }
}
