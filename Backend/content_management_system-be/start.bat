@echo off
REM Startup script for CMS Docker environment (Windows)

echo.
echo ========================================
echo CMS Docker Startup Script
echo Content Management System with RabbitMQ
echo ========================================
echo.

REM Check if Docker is running
echo [1/7] Checking Docker...
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)
echo [OK] Docker is running
echo.

REM Check if .env file exists
echo [2/7] Checking environment configuration...
if not exist .env (
    echo [WARNING] .env file not found. Creating from .env.example...
    copy .env.example .env >nul
    echo [WARNING] Please edit .env file with your credentials!
    echo Press any key after editing .env, or Ctrl+C to cancel...
    pause >nul
)
echo [OK] Environment configuration found
echo.

REM Clean up old containers
echo [3/7] Cleaning up old containers...
docker-compose down >nul 2>&1
echo [OK] Cleanup complete
echo.

REM Build images
echo [4/7] Building Docker images...
echo This may take a few minutes on first run...
docker-compose build
if errorlevel 1 (
    echo [ERROR] Failed to build images!
    pause
    exit /b 1
)
echo [OK] Images built successfully
echo.

REM Start services
echo [5/7] Starting services...
docker-compose up -d
if errorlevel 1 (
    echo [ERROR] Failed to start services!
    pause
    exit /b 1
)
echo [OK] Services started
echo.

REM Wait for services
echo [6/7] Waiting for services to be healthy...
echo This may take 30-60 seconds...
timeout /t 5 /nobreak >nul

:wait_rabbitmq
echo Checking RabbitMQ...
docker-compose exec -T rabbitmq rabbitmq-diagnostics -q ping >nul 2>&1
if errorlevel 1 (
    timeout /t 2 /nobreak >nul
    goto wait_rabbitmq
)
echo [OK] RabbitMQ is ready

:wait_mongodb
echo Checking MongoDB...
docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" >nul 2>&1
if errorlevel 1 (
    timeout /t 2 /nobreak >nul
    goto wait_mongodb
)
echo [OK] MongoDB is ready

:wait_api
echo Checking CMS API...
curl -f http://localhost:5000/api/health >nul 2>&1
if errorlevel 1 (
    timeout /t 2 /nobreak >nul
    goto wait_api
)
echo [OK] CMS API is ready
echo.

REM Print access information
echo [7/7] Startup complete!
echo.
echo ========================================
echo     CMS is ready!
echo ========================================
echo.
echo Access URLs:
echo   API:              http://localhost:5000
echo   API Health:       http://localhost:5000/api/health
echo   RabbitMQ UI:      http://localhost:15672
echo   MongoDB:          mongodb://localhost:27017
echo.
echo Default Credentials (from .env):
echo   RabbitMQ:         cmsadmin / CmsSecurePassword123!
echo   MongoDB:          admin / MongoSecurePassword123!
echo.
echo Useful Commands:
echo   View logs:        docker-compose logs -f
echo   Stop services:    docker-compose down
echo   Restart:          docker-compose restart
echo   Service status:   docker-compose ps
echo   Scale workers:    docker-compose up -d --scale cms-worker=5
echo.
echo ========================================
echo.
pause
