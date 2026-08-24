# Docker Compose Deployment Guide

## Quick Start

### 1. Setup Environment Variables

Copy the example environment file:
```powershell
Copy-Item env.docker.example .env
```

Edit `.env` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 2. Pull and Run

```powershell
# Pull the latest image from Docker Hub
docker-compose pull

# Start the container
docker-compose up -d

# View logs
docker-compose logs -f
```

### 3. Access Application

Open your browser to: **http://localhost:3000**

---

## Commands Reference

```powershell
# Pull latest image
docker-compose pull

# Start in foreground
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f mansaoferta

# Stop containers
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Restart
docker-compose up -d

# Check container status
docker-compose ps

# Execute command in container
docker-compose exec mansaoferta sh
```

---

## Updating the Application

```powershell
# 1. Pull latest image
docker-compose pull

# 2. Restart
docker-compose up -d
```

---

## Troubleshooting

### Port 3000 Already in Use
Edit `docker-compose.yml` and change the port mapping:
```yaml
ports:
  - "8080:3000"  # Use port 8080 instead
```

### Container Keeps Restarting
Check logs:
```powershell
docker-compose logs mansaoferta
```

Common issues:
- Missing environment variables
- Incorrect Supabase credentials
- Port conflicts

### View Container Health
```powershell
docker-compose ps
```

Look for "healthy" status.

---

## Production Deployment

For production, consider:

1. **Use specific image tags** instead of `latest`
2. **Add reverse proxy** (nginx, traefik)
3. **Enable SSL/TLS**
4. **Set resource limits**
5. **Configure logging**

Example production `docker-compose.yml`:
```yaml
services:
  mansaoferta:
    image: mansaoferta:v1.0.0
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

---

## Comparison: Docker Compose vs Kubernetes

| Feature | Docker Compose | Kubernetes |
|---------|---------------|------------|
| **Complexity** | Simple | Advanced |
| **Use Case** | Development, small deployments | Production, scale |
| **Auto-scaling** | No | Yes |
| **Load Balancing** | Basic | Advanced |
| **Multi-host** | No | Yes |
| **Best For** | Local dev, single server | Cloud, enterprise |

---

## Next Steps

- ✅ Local development: Use Docker Compose
- ✅ Testing: Use local Kubernetes (Docker Desktop)
- ✅ Production: Use GKE Autopilot (see `DEPLOYMENT.md`)
