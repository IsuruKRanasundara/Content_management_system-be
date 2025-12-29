using CMS.Mappings;
using CMS.Models;
using CMS.Services.Implementations;
using CMS.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using System.Net.Security;
using System.Security.Authentication;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
// Configure AutoMapper with explicit profile assembly reference
builder.Services.AddAutoMapper(typeof(MappingProfile));
// Add services to the container.

builder.Services.AddDbContext<CmsDbContext>(options =>
    options.UseInMemoryDatabase("CmsDb"));

builder.Services.Configure<MongoDbSettings>(builder.Configuration.GetSection("MongoDbSettings"));
builder.Services.AddSingleton<IMongoClient>(sp =>
{
    var settings = sp.GetRequiredService<IConfiguration>().GetSection("MongoDbSettings");
    var connectionString = settings["ConnectionString"];
    if (string.IsNullOrWhiteSpace(connectionString))
    {
        throw new InvalidOperationException("MongoDbSettings:ConnectionString is missing");
    }
    
    // Configure MongoDB client settings with explicit TLS/SSL configuration
    var mongoClientSettings = MongoClientSettings.FromConnectionString(connectionString);
    
    // Configure SSL/TLS settings for .NET 10 compatibility
    mongoClientSettings.SslSettings = new SslSettings
    {
        EnabledSslProtocols = SslProtocols.Tls12 | SslProtocols.Tls13,
        CheckCertificateRevocation = false,
        ServerCertificateValidationCallback = (sender, certificate, chain, sslPolicyErrors) =>
        {
            // For MongoDB Atlas, accept the certificate
            return sslPolicyErrors == SslPolicyErrors.None || 
                   sslPolicyErrors == SslPolicyErrors.RemoteCertificateChainErrors;
        }
    };
    
    // Set connection timeouts
    mongoClientSettings.ServerSelectionTimeout = TimeSpan.FromSeconds(30);
    mongoClientSettings.ConnectTimeout = TimeSpan.FromSeconds(30);
    
    return new MongoClient(mongoClientSettings);
});

builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IContentService, ContentService>();
builder.Services.AddScoped<ICommentService, CommentService>();
builder.Services.AddScoped<ITagService, TagService>();
builder.Services.AddScoped<IContentTagService, ContentTagService>();
builder.Services.AddScoped<IMediaService, MediaService>();
builder.Services.AddSingleton<ICommentRepository, CommentRepository>();

var allowedOrigins = new[]
{
    "http://localhost:3000",
    "http://localhost:5173",
    "https://your-frontend.com"
};

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSection["Key"] ?? throw new InvalidOperationException("Jwt:Key configuration is missing");
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSection["Issuer"],
        ValidAudience = jwtSection["Audience"],
        IssuerSigningKey = signingKey,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Serve static files from uploads directory
var uploadsPath = Path.Combine(builder.Environment.ContentRootPath, "uploads");
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
