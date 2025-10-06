# SQL CTF App - Quick Setup Guide

## Prerequisites
- Git
- Docker & Docker Compose (or Node.js 20+ for manual setup)

## Quick Start with Docker (Recommended)

### 1. Clone the Repository
```bash
git clone <repository-url> sql-ctf-app
cd sql-ctf-app
```

### 2. Create Environment File
```bash
echo "JWT_SECRET=change-this-secret-key-in-production" > .env
```

### 3. Run the Application
```bash
# Start both frontend and backend
docker-compose up -d

# Check if running
docker-compose ps
```

### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### 5. Stop the Application
```bash
docker-compose down
```

## Manual Setup (Without Docker)

### Backend Setup
```bash
cd backend
npm install
echo "JWT_SECRET=change-this-secret" > .env
npm run build
npm start
```

### Frontend Setup (New Terminal)
```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:5000" > .env
npm run build
npm run preview
```

## Production Deployment

### 1. On Your Server
```bash
# Clone and navigate
git clone <repository-url> /opt/sql-ctf-app
cd /opt/sql-ctf-app

# Set production environment
echo "JWT_SECRET=$(openssl rand -base64 32)" > .env
echo "NODE_ENV=production" >> .env
```

### 2. Run Production Setup
```bash
# Use production compose file for load balancing
docker-compose -f docker-compose.prod.yml up -d
```

## Essential Environment Variables

### Required
- `JWT_SECRET` - Secret key for authentication (MUST change in production)

### Optional
- `NODE_ENV` - Set to 'production' for production deployment
- `PORT` - Backend port (default: 5000)
- `DATABASE_PATH` - SQLite database location (default: ./data/main.db)

## Common Commands

```bash
# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Rebuild after code changes
docker-compose up --build -d

# Reset admin password
docker exec -it <backend-container> node src/scripts/resetAdminPassword.js
```

## Troubleshooting

### Port Already in Use
```bash
# Change ports in docker-compose.yml or use different ports
# Frontend: change "3000:3000" to "3001:3000"
# Backend: change "5000:5000" to "5001:5000"
```

### Can't Connect Frontend to Backend
- Check if both containers are running: `docker-compose ps`
- Verify .env file exists with JWT_SECRET
- Check firewall isn't blocking ports 3000 and 5000

### Database Issues
```bash
# Create data directory if missing
mkdir -p backend/data
# Fix permissions
chmod 755 backend/data
```

## Backup Database
```bash
# Simple backup
cp backend/data/main.db backup_$(date +%Y%m%d).db
```

## Update Application
```bash
git pull
docker-compose down
docker-compose up --build -d
```

---
**Note**: For detailed configuration and advanced setup options, refer to SETUP_GUIDE.md
