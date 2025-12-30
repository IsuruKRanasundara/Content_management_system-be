# 🚀 Quick Start Guide - CMS Docker

## ⚡ Fastest Way to Run

### Windows
```cmd
start.bat
```

### Linux/Mac
```bash
chmod +x start.sh
./start.sh
```

### Using Make (Linux/Mac/WSL)
```bash
make up
```

---

## 📝 Essential Commands

### Start Everything
```bash
docker-compose up -d
```

### Stop Everything
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f
```

### Check Status
```bash
docker-compose ps
```

### Restart Services
```bash
docker-compose restart
```

### Scale Workers
```bash
docker-compose up -d --scale cms-worker=5
```

---

## 🔗 Access URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| **CMS API** | http://localhost:5000 | - |
| **API Health** | http://localhost:5000/api/health | - |
| **RabbitMQ UI** | http://localhost:15672 | cmsadmin / CmsSecurePassword123! |
| **MongoDB** | mongodb://localhost:27017 | admin / MongoSecurePassword123! |

---

## 🎯 Common Tasks

### First Time Setup
```bash
# 1. Copy environment file
cp .env.example .env

# 2. Edit with your credentials
notepad .env  # Windows
nano .env     # Linux/Mac

# 3. Start services
docker-compose up -d
```

### Development Mode (Infrastructure Only)
```bash
# Start only RabbitMQ and MongoDB
docker-compose -f docker-compose.dev.yml up -d

# Run API locally
dotnet run
```

### Production Mode
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### View Specific Service Logs
```bash
docker-compose logs -f cms-api
docker-compose logs -f cms-worker
docker-compose logs -f rabbitmq
```

### Execute Commands in Containers
```bash
# Shell into API container
docker-compose exec cms-api bash

# MongoDB shell
docker-compose exec mongodb mongosh

# RabbitMQ management
docker-compose exec rabbitmq rabbitmqctl list_queues
```

### Resource Monitoring
```bash
# View resource usage
docker stats

# View disk usage
docker system df
```

---

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5672
taskkill /PID <PID> /F

# Linux/Mac
sudo lsof -ti:5672 | xargs kill -9
```

### Service Won't Start
```bash
# View logs for errors
docker-compose logs <service-name>

# Restart service
docker-compose restart <service-name>

# Full rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Clean Everything and Start Fresh
```bash
docker-compose down -v --rmi all
docker-compose up -d --build
```

### Check Service Health
```bash
# All services
docker-compose ps

# API health
curl http://localhost:5000/api/health

# RabbitMQ health
docker-compose exec rabbitmq rabbitmq-diagnostics -q ping
```

---

## 📦 File Structure

```
Backend/content_management_system-be/
├── Dockerfile                 # API Docker image
├── Dockerfile.worker          # Worker Docker image
├── docker-compose.yml         # Main compose file
├── docker-compose.dev.yml     # Development mode
├── docker-compose.prod.yml    # Production mode
├── .env.example               # Environment template
├── .dockerignore              # Docker build exclusions
├── start.sh                   # Linux/Mac startup script
├── start.bat                  # Windows startup script
├── Makefile                   # Convenient make commands
└── DOCKER_GUIDE.md           # Full documentation
```

---

## 🔒 Security Checklist

- [ ] Copy `.env.example` to `.env`
- [ ] Change default passwords in `.env`
- [ ] Generate strong JWT secret key
- [ ] Never commit `.env` to Git
- [ ] Use Docker secrets in production
- [ ] Enable HTTPS/SSL in production
- [ ] Restrict MongoDB/RabbitMQ ports in production

---

## 📊 Monitoring

### RabbitMQ Management UI
- URL: http://localhost:15672
- Monitor queues, exchanges, connections
- View message rates and throughput

### Docker Stats
```bash
# Real-time resource usage
docker stats

# Specific container
docker stats cms-api
```

### Log Aggregation
```bash
# All logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100 cms-api

# Since time
docker-compose logs --since 30m cms-api
```

---

## 🎓 Next Steps

1. ✅ Run `docker-compose up -d`
2. ✅ Access API at http://localhost:5000
3. ✅ Check RabbitMQ UI at http://localhost:15672
4. ✅ Test API endpoints
5. ✅ Monitor logs: `docker-compose logs -f`
6. 📚 Read full guide: `DOCKER_GUIDE.md`
7. 🔐 Configure production secrets
8. 🚀 Deploy to cloud

---

## 💡 Pro Tips

- Use `make` commands for convenience (Linux/Mac/WSL)
- Run `start.sh` or `start.bat` for guided setup
- Keep Docker Desktop running for best performance
- Allocate at least 4GB RAM to Docker
- Use `docker-compose.dev.yml` for local development
- Scale workers independently: `--scale cms-worker=N`
- Monitor disk usage: `docker system df`
- Clean unused resources: `docker system prune`

---

## 📞 Need Help?

- Full Documentation: `DOCKER_GUIDE.md`
- RabbitMQ Guide: `RABBITMQ_IMPLEMENTATION_GUIDE.md`
- Check logs: `docker-compose logs -f`
- Service status: `docker-compose ps`
- Health check: `make health` or `curl localhost:5000/api/health`

---

**Happy Deploying! 🎉**
