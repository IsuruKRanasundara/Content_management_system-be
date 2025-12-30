# 🚀 CMS with RabbitMQ - Docker Deployment

Production-ready Docker setup for ASP.NET Core Content Management System with RabbitMQ background processing.

## ✨ Features

- 🐳 **Fully Dockerized** - API, Workers, RabbitMQ, MongoDB
- 🔄 **Background Processing** - Async content publishing, notifications, audit logs
- 📦 **Multi-stage Builds** - Optimized Docker images
- 🔒 **Security First** - Non-root users, environment variables, health checks
- 📊 **Scalable** - Independent scaling for API and workers
- 🎯 **Production Ready** - Logging, monitoring, health checks

## 🎬 Quick Start

### Prerequisites
- Docker Desktop 20.10+ ([Download](https://www.docker.com/products/docker-desktop))
- 4GB+ RAM available
- 10GB+ disk space

### Run in 3 Steps

**Windows:**
```cmd
start.bat
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

**Or manually:**
```bash
# 1. Setup environment
cp .env.example .env

# 2. Start services
docker-compose up -d

# 3. Check health
docker-compose ps
```

### Access Services

| Service | URL | Credentials |
|---------|-----|-------------|
| **API** | http://localhost:5000 | - |
| **RabbitMQ UI** | http://localhost:15672 | cmsadmin / CmsSecurePassword123! |
| **MongoDB** | mongodb://localhost:27017 | admin / MongoSecurePassword123! |

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Essential commands and quick reference
- **[DOCKER_GUIDE.md](DOCKER_GUIDE.md)** - Complete Docker deployment guide
- **[RABBITMQ_IMPLEMENTATION_GUIDE.md](RABBITMQ_IMPLEMENTATION_GUIDE.md)** - RabbitMQ architecture and usage

## 🗂️ What's Included

```
├── Dockerfile                  # API Docker image
├── Dockerfile.worker           # Worker Docker image  
├── docker-compose.yml          # Development setup
├── docker-compose.prod.yml     # Production setup
├── docker-compose.dev.yml      # Infrastructure only
├── .env.example                # Environment template
├── start.sh / start.bat        # Startup scripts
├── Makefile                    # Convenient commands
└── .dockerignore               # Build optimization
```

## 🎯 Common Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Scale workers
docker-compose up -d --scale cms-worker=5

# Check health
curl http://localhost:5000/api/health
```

## 🏗️ Architecture

```
┌──────────────────────────────────────────┐
│           Docker Network                  │
│                                          │
│  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │ RabbitMQ │  │ MongoDB  │  │   API  ││
│  │          │◄─┤          │◄─┤ (x3)   ││
│  └────┬─────┘  └──────────┘  └────────┘│
│       │                                  │
│       ▼                                  │
│  ┌──────────┐                           │
│  │ Workers  │                           │
│  │  (x2)    │                           │
│  └──────────┘                           │
└──────────────────────────────────────────┘
```

**Services:**
- **RabbitMQ** - Message broker for async tasks
- **MongoDB** - Database for CMS data
- **CMS API** - REST API (scalable)
- **CMS Workers** - Background processors (scalable)

## 🔄 Development Workflow

### Local Development (Run API locally)
```bash
# Start only infrastructure
docker-compose -f docker-compose.dev.yml up -d

# Run API from Visual Studio or CLI
dotnet run

# API connects to containerized RabbitMQ and MongoDB
```

### Full Docker Development
```bash
# Start everything in Docker
docker-compose up -d

# View API logs
docker-compose logs -f cms-api

# View worker logs
docker-compose logs -f cms-worker
```

### Production Deployment
```bash
# Use production compose
docker-compose -f docker-compose.prod.yml up -d

# 3 API replicas, 3 worker replicas, optimized resources
```

## 🛠️ Configuration

### Environment Variables (.env)

```bash
# RabbitMQ
RABBITMQ_USER=cmsadmin
RABBITMQ_PASSWORD=YourStrongPassword

# MongoDB  
MONGO_USER=admin
MONGO_PASSWORD=YourMongoPassword

# JWT
JWT_SECRET_KEY=YourSecretKey32CharsOrMore
```

### Resource Limits (Production)

```yaml
cms-api:
  deploy:
    replicas: 3
    resources:
      limits:
        cpus: '1'
        memory: 1G

cms-worker:
  deploy:
    replicas: 3
    resources:
      limits:
        cpus: '1'  
        memory: 1G
```

## 📊 Monitoring

### Health Checks

```bash
# API health endpoint
curl http://localhost:5000/api/health

# RabbitMQ health
docker-compose exec rabbitmq rabbitmq-diagnostics -q ping

# Container health
docker-compose ps
```

### Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f cms-api
docker-compose logs -f cms-worker
docker-compose logs -f rabbitmq

# Last 100 lines
docker-compose logs --tail=100 cms-api
```

### Resource Usage

```bash
# Real-time stats
docker stats

# Disk usage
docker system df
```

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Change ports in docker-compose.yml
ports:
  - "5001:8080"  # Use different host port
```

### Services Won't Start
```bash
# Check logs
docker-compose logs

# Rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Clean Start
```bash
# Remove everything and start fresh
docker-compose down -v --rmi all
docker-compose up -d --build
```

### Performance Issues
```bash
# Increase Docker Desktop memory
# Docker Desktop > Settings > Resources > Memory (4GB+)

# Or reduce replicas
docker-compose up -d --scale cms-worker=1
```

## 🚀 Scaling

### Scale Workers
```bash
# Scale to 5 worker instances
docker-compose up -d --scale cms-worker=5

# Scale API instances
docker-compose up -d --scale cms-api=3
```

### Production Scaling
```yaml
# Edit docker-compose.prod.yml
cms-api:
  deploy:
    replicas: 5  # Scale to 5 API instances

cms-worker:
  deploy:
    replicas: 10  # Scale to 10 worker instances
```

## 🔒 Security

### Best Practices
- ✅ Use strong passwords in `.env`
- ✅ Never commit `.env` to Git
- ✅ Generate secure JWT key (32+ chars)
- ✅ Run containers as non-root users (already configured)
- ✅ Use Docker secrets in production
- ✅ Enable HTTPS/SSL
- ✅ Restrict exposed ports
- ✅ Regular security scans

### Production Checklist
- [ ] Change all default passwords
- [ ] Generate strong JWT secret
- [ ] Configure SSL/TLS
- [ ] Set up log aggregation
- [ ] Enable monitoring/alerting
- [ ] Implement backup strategy
- [ ] Use secrets management
- [ ] Configure firewalls

## 🌐 Cloud Deployment

### AWS ECS
```bash
# Push to ECR
docker tag cms-api:latest <account-id>.dkr.ecr.<region>.amazonaws.com/cms-api
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/cms-api

# Create ECS task definition and service
```

### Azure Container Instances
```bash
# Push to ACR
docker tag cms-api:latest <registry>.azurecr.io/cms-api
docker push <registry>.azurecr.io/cms-api

# Deploy to ACI
az container create --resource-group myRG --file docker-compose.yml
```

### Google Cloud Run
```bash
# Push to GCR
docker tag cms-api:latest gcr.io/<project-id>/cms-api
docker push gcr.io/<project-id>/cms-api

# Deploy
gcloud run deploy cms-api --image gcr.io/<project-id>/cms-api
```

## 📈 Performance Tips

- Allocate 4GB+ RAM to Docker Desktop
- Use SSD for Docker volumes
- Enable BuildKit for faster builds
- Use multi-stage builds (already configured)
- Implement caching strategies
- Monitor and scale workers based on queue depth
- Use connection pooling
- Optimize database queries

## 🧪 Testing

```bash
# Run tests in container
docker-compose exec cms-api dotnet test

# Integration tests with Testcontainers
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

## 📝 License

[Your License Here]

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test with Docker
5. Submit pull request

## 📞 Support

- 📖 [Full Docker Guide](DOCKER_GUIDE.md)
- 📖 [Quick Reference](QUICKSTART.md)
- 📖 [RabbitMQ Guide](RABBITMQ_IMPLEMENTATION_GUIDE.md)
- 🐛 [Report Issues](https://github.com/your-repo/issues)

---

**Built with ❤️ using Docker, .NET, and RabbitMQ**
