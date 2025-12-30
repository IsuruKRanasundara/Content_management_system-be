using CMS.Models;
using CMS.Services.Interfaces;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace CMS.Services.Implementations
{
    public class CommentRepository : ICommentRepository
    {
        public IMongoCollection<CommentDocument> Collection { get; }

        public CommentRepository(IOptions<MongoDbSettings> options, IMongoClient client)
        {
            ArgumentNullException.ThrowIfNull(options);
            ArgumentNullException.ThrowIfNull(client);
            var settings = options.Value ?? throw new InvalidOperationException("MongoDbSettings are not configured.");
            var database = client.GetDatabase(settings.DatabaseName);
            Collection = database.GetCollection<CommentDocument>("comments");

            var indexes = new List<CreateIndexModel<CommentDocument>>
            {
                new CreateIndexModel<CommentDocument>(
                    Builders<CommentDocument>.IndexKeys.Ascending(c => c.ContentId).Descending(c => c.CreatedAt)),
                new CreateIndexModel<CommentDocument>(
                    Builders<CommentDocument>.IndexKeys.Ascending(c => c.ParentId))
            };
            Collection.Indexes.CreateMany(indexes);
        }

        public async Task<(IReadOnlyList<CommentDocument> roots, long total)> GetRootCommentsAsync(int contentId, int page, int pageSize)
        {
            var filter = Builders<CommentDocument>.Filter.Where(c => c.ContentId == contentId && c.ParentId == null);
            var total = await Collection.CountDocumentsAsync(filter);

            var roots = await Collection
                .Find(filter)
                .SortByDescending(c => c.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Limit(pageSize)
                .ToListAsync();

            return (roots, total);
        }

        public async Task<IReadOnlyList<CommentDocument>> GetRepliesAsync(IEnumerable<string> parentIds)
        {
            var ids = parentIds.Where(id => !string.IsNullOrWhiteSpace(id)).ToArray();
            if (!ids.Any())
            {
                return Array.Empty<CommentDocument>();
            }

            var filter = Builders<CommentDocument>.Filter.In(c => c.ParentId, ids);
            var replies = await Collection
                .Find(filter)
                .SortByDescending(c => c.CreatedAt)
                .ToListAsync();

            return replies;
        }

        public Task<CommentDocument> GetByIdAsync(string id)
        {
            return Collection.Find(c => c.Id == id).FirstOrDefaultAsync();
        }

        public Task InsertAsync(CommentDocument comment)
        {
            return Collection.InsertOneAsync(comment);
        }

        public Task UpdateAsync(CommentDocument comment)
        {
            return Collection.ReplaceOneAsync(c => c.Id == comment.Id, comment);
        }
    }
}
