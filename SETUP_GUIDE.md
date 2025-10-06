# SQL CTF Challenge Application - Complete Setup Guide

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation Methods](#installation-methods)
4. [Method 1: Docker Setup (Recommended)](#method-1-docker-setup-recommended)
5. [Method 2: Manual Setup](#method-2-manual-setup)
6. [Environment Configuration](#environment-configuration)
7. [Database Setup](#database-setup)
8. [Running the Application](#running-the-application)
9. [Production Deployment](#production-deployment)
10. [Troubleshooting](#troubleshooting)
11. [Security Considerations](#security-considerations)

## Overview

This is a full-stack SQL CTF (Capture The Flag) challenge application consisting of:
- **Backend**: Node.js/TypeScript with Express.js
- **Frontend**: React with TypeScript and Vite
- **Database**: SQLite with Better-SQLite3
- **Authentication**: JWT-based authentication
- **Containerization**: Docker and Docker Compose
- **Web Server**: Nginx (for production)

## Prerequisites

### System Requirements
- **Operating System**: Linux, macOS, or Windows (with WSL2 for Docker)
- **RAM**: Minimum 4GB (8GB recommended for development)
- **Storage**: At least 2GB free space

### Required Software

#### For Docker Setup:
- Docker Engine 20.10+ 
- Docker Compose 2.0+

#### For Manual Setup:
- Node.js 20.x or higher
- npm 9.x or higher
- Git

## Installation Methods

Choose one of the following methods based on your preference and environment.

## Method 1: Docker Setup (Recommended)

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone <repository-url> sql-ctf-app
cd sql-ctf-app
```

### Step 2: Create Environment File

Create a `.env` file in the root directory:

```bash
# Create .env file
touch .env
```

Add the following content to `.env`:

```env
# JWT Secret - CHANGE THIS IN PRODUCTION!
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Node Environment
NODE_ENV=development

# Backend Configuration
BACKEND_PORT=5000
BACKEND_HOST=localhost

# Frontend Configuration
FRONTEND_PORT=3000
FRONTEND_HOST=localhost

# Database Configuration
DATABASE_PATH=./data/main.db

# Admin Credentials (for initial setup)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=changeme123!

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 3: Build and Run with Docker Compose

#### Development Mode:

```bash
# Build and start the containers
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

#### Production Mode (Single Server):

```bash
# Use the production compose file
docker-compose -f docker-compose.prod.yml up --build -d
```

### Step 4: Verify Installation

Open your browser and navigate to:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Method 2: Manual Setup

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone <repository-url> sql-ctf-app
cd sql-ctf-app
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create data directory for SQLite database
mkdir -p data

# Create environment file
cat > .env << EOF
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
PORT=5000
DATABASE_PATH=./data/main.db
EOF

# Build TypeScript files
npm run build

# Run database migrations (if applicable)
# npm run migrate

# Start the backend server
npm run dev  # For development
# OR
npm start    # For production (requires build first)
```

### Step 3: Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cat > .env << EOF
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
EOF

# Start the frontend development server
npm run dev

# For production build
npm run build
npm run preview  # To preview the production build
```

## Environment Configuration

### Backend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `JWT_SECRET` | Secret key for JWT token signing | - | Yes |
| `NODE_ENV` | Environment mode (development/production) | development | No |
| `PORT` | Backend server port | 5000 | No |
| `DATABASE_PATH` | Path to SQLite database file | ./data/main.db | No |
| `CORS_ORIGIN` | Allowed CORS origins | http://localhost:3000 | No |
| `RATE_LIMIT_WINDOW_MS` | Rate limit time window in ms | 900000 | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 | No |

### Frontend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API URL | http://localhost:5000 | Yes |
| `VITE_WS_URL` | WebSocket server URL | ws://localhost:5000 | Yes |

## Database Setup

### Initial Database Creation

The application uses SQLite. The database will be automatically created on first run.

### Manual Database Setup (if needed)

```bash
cd backend

# Create database directory
mkdir -p data

# Run migration script (if available)
npm run migrate

# Or initialize database manually
node src/scripts/migrateDatabase.js
```

### Reset Admin Password

If you need to reset the admin password:

```bash
cd backend
node src/scripts/resetAdminPassword.js
```

## Running the Application

### Development Mode

#### Using Docker:
```bash
docker-compose up
```

#### Manual:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api-docs (if available)

### Production Mode

#### Using Docker (Recommended):

```bash
# Build and run with production configuration
docker-compose -f docker-compose.prod.yml up -d

# Check container status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

#### Manual Production Deployment:

```bash
# Backend
cd backend
npm run build
NODE_ENV=production node dist/server.js

# Frontend (with nginx)
cd frontend
npm run build
# Copy dist folder contents to nginx html directory
cp -r dist/* /usr/share/nginx/html/

# Configure nginx (see nginx.conf)
```

## Production Deployment

### Step 1: Server Preparation

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker and Docker Compose (Ubuntu/Debian)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Step 2: Configure Firewall

```bash
# Allow necessary ports
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS (if using SSL)
sudo ufw enable
```

### Step 3: Deploy Application

```bash
# Clone repository
git clone <repository-url> /opt/sql-ctf-app
cd /opt/sql-ctf-app

# Create production .env file
cat > .env << EOF
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
EOF

# Start application
docker-compose -f docker-compose.prod.yml up -d
```

### Step 4: Setup SSL (Optional but Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

### Step 5: Configure Nginx with SSL

Update `nginx.prod.conf` to include SSL configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # ... rest of configuration
}
```

## Monitoring and Maintenance

### View Logs

```bash
# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend

# System logs
journalctl -u docker -f
```

### Backup Database

```bash
# Create backup directory
mkdir -p backups

# Backup SQLite database
cp backend/data/main.db backups/main_$(date +%Y%m%d_%H%M%S).db

# Automated backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups"
DB_PATH="/opt/sql-ctf-app/backend/data/main.db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cp $DB_PATH $BACKUP_DIR/main_$TIMESTAMP.db

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.db" -mtime +7 -delete
EOF

chmod +x backup.sh

# Add to crontab for daily backups
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/sql-ctf-app/backup.sh") | crontab -
```

### Update Application

```bash
# Stop containers
docker-compose down

# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose up --build -d
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Port Already in Use

```bash
# Check what's using the port
sudo lsof -i :3000
sudo lsof -i :5000

# Kill the process or change ports in .env file
```

#### 2. Database Connection Issues

```bash
# Check database file permissions
ls -la backend/data/

# Fix permissions
chmod 644 backend/data/main.db
```

#### 3. Docker Build Failures

```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

#### 4. Frontend Can't Connect to Backend

- Check CORS settings in backend
- Verify environment variables
- Check firewall rules
- Ensure backend is running

#### 5. Memory Issues

```bash
# Check Docker memory usage
docker stats

# Increase Docker memory limit
# Edit docker-compose.yml and add:
services:
  backend:
    mem_limit: 512m
```

### Debug Mode

Enable debug logging:

```bash
# Backend
DEBUG=* npm run dev

# Docker
docker-compose logs --tail=100 -f
```

## Security Considerations

### Production Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Use strong admin password
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Disable debug mode in production
- [ ] Regular security updates
- [ ] Implement rate limiting
- [ ] Use environment variables for secrets
- [ ] Regular database backups
- [ ] Monitor logs for suspicious activity
- [ ] Keep dependencies updated

### Security Headers

Ensure nginx configuration includes security headers:

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

## Performance Optimization

### Backend Optimization

```bash
# Use PM2 for process management
npm install -g pm2
pm2 start dist/server.js -i max
pm2 save
pm2 startup
```

### Frontend Optimization

```bash
# Build with optimization
npm run build -- --mode production

# Enable gzip compression in nginx
gzip on;
gzip_types text/plain application/json application/javascript text/css;
```

## Support and Resources

### Useful Commands Reference

```bash
# Docker Commands
docker-compose up -d              # Start in background
docker-compose down               # Stop all containers
docker-compose logs -f            # View logs
docker-compose restart backend    # Restart specific service
docker exec -it <container> sh    # Access container shell

# NPM Commands
npm install                       # Install dependencies
npm run dev                       # Start development server
npm run build                     # Build for production
npm test                          # Run tests

# Database Commands
sqlite3 backend/data/main.db     # Access SQLite CLI
.tables                           # List tables
.schema                           # Show schema
.quit                            # Exit SQLite CLI
```

### Directory Structure

```
sql-ctf-app/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── scripts/         # Utility scripts
│   │   └── server.ts        # Main server file
│   ├── data/                # SQLite database
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   └── App.tsx          # Main app component
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml        # Development compose
├── docker-compose.prod.yml   # Production compose
├── Dockerfile.backend
├── Dockerfile.frontend
├── nginx.conf               # Development nginx config
├── nginx.prod.conf          # Production nginx config
└── .env                     # Environment variables
```

## Conclusion

This guide provides comprehensive instructions for setting up the SQL CTF application. For additional help:

1. Check application logs for error messages
2. Review the troubleshooting section
3. Ensure all prerequisites are installed
4. Verify environment variables are correctly set

Remember to always:
- Keep the application and dependencies updated
- Follow security best practices
- Maintain regular backups
- Monitor application performance and logs
