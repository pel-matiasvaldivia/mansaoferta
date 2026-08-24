# Local Kubernetes Deployment (Docker Desktop)

## Prerequisites

1. **Docker Desktop** must be installed and running
2. **Kubernetes** must be enabled in Docker Desktop settings
   - Open Docker Desktop
   - Go to Settings → Kubernetes
   - Check "Enable Kubernetes"
   - Click "Apply & Restart"

---

## Step 1: Start Docker Desktop

Make sure Docker Desktop is running. You should see the Docker icon in your system tray.

Verify Docker is running:
```powershell
docker version
```

Verify Kubernetes is running:
```powershell
kubectl config current-context
# Should show: docker-desktop
```

---

## Step 2: Build Docker Image Locally

```powershell
cd c:\Users\Matias\Documents\mansaoferta.com.ar

# Build the image
docker build -t mansaoferta:local .
```

This will take 2-5 minutes the first time.

Verify the image was created:
```powershell
docker images | Select-String mansaoferta
```

---

## Step 3: Update Kubernetes Manifests for Local

The local deployment uses slightly different configurations than GKE.

### Update ConfigMap
Edit `k8s/local/configmap.yaml` (already created for you):
- Update `NEXT_PUBLIC_SUPABASE_URL` with your Supabase URL
- Update `NEXT_PUBLIC_BASE_URL` to `http://localhost`

### Update Secret
Edit `k8s/local/secret.yaml` (already created for you):
- Encode your Supabase anon key:
  ```powershell
  [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes("your-supabase-anon-key"))
  ```
- Replace the value in the YAML file

---

## Step 4: Deploy to Local Kubernetes

```powershell
# Apply all manifests
kubectl apply -f k8s/local/configmap.yaml
kubectl apply -f k8s/local/secret.yaml
kubectl apply -f k8s/local/deployment.yaml
kubectl apply -f k8s/local/service.yaml
```

---

## Step 5: Verify Deployment

```powershell
# Check if pods are running
kubectl get pods

# Check deployment status
kubectl get deployment mansaoferta

# Check service
kubectl get service mansaoferta-service
```

Wait for pods to show `Running` status (may take 1-2 minutes).

---

## Step 6: Access the Application

### Option A: Port Forward (Recommended for Local)
```powershell
kubectl port-forward service/mansaoferta-service 3000:80
```

Then open: http://localhost:3000

### Option B: NodePort (Alternative)
The service is configured with NodePort, so you can also access via:
http://localhost:30000

---

## Monitoring

### View Logs
```powershell
# Get pod name
kubectl get pods

# View logs (replace POD_NAME)
kubectl logs POD_NAME

# Follow logs
kubectl logs -f POD_NAME
```

### Check Pod Details
```powershell
kubectl describe pod POD_NAME
```

---

## Troubleshooting

### Docker Desktop Not Running
**Error**: `error during connect: ... pipe/dockerDesktopLinuxEngine`

**Solution**: Start Docker Desktop application

### Pods Not Starting
```powershell
kubectl describe pod POD_NAME
kubectl logs POD_NAME
```

Common issues:
- Image pull errors (image not built locally)
- Environment variable errors
- Resource limits too high for local machine

### Port Already in Use
If port 3000 or 30000 is already in use:
```powershell
# Find what's using the port
netstat -ano | findstr :3000

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

Or use a different port:
```powershell
kubectl port-forward service/mansaoferta-service 8080:80
```

---

## Making Changes

### Rebuild and Redeploy
```powershell
# 1. Build new image
docker build -t mansaoferta:local .

# 2. Delete existing pods (they will recreate with new image)
kubectl delete pod -l app=mansaoferta

# 3. Wait for new pods to start
kubectl get pods -w
```

### Update Environment Variables
```powershell
# Edit configmap or secret
kubectl edit configmap mansaoferta-config
# or
kubectl edit secret mansaoferta-secrets

# Restart pods to pick up changes
kubectl rollout restart deployment mansaoferta
```

---

## Cleanup

```powershell
# Delete all resources
kubectl delete -f k8s/local/

# Or delete individually
kubectl delete deployment mansaoferta
kubectl delete service mansaoferta-service
kubectl delete configmap mansaoferta-config
kubectl delete secret mansaoferta-secrets
```

---

## Differences from GKE Deployment

| Feature | Local (Docker Desktop) | GKE Autopilot |
|---------|----------------------|---------------|
| Image Registry | Local Docker | Google Container Registry |
| Service Type | NodePort | ClusterIP + Ingress |
| SSL/TLS | None | Google-managed certificates |
| Load Balancer | None | Google Cloud Load Balancer |
| Scaling | Manual | Automatic |
| Resource Limits | Lower | Production-ready |

---

## Next Steps

Once you verify the app works locally:
1. Test all features (login, cart, orders, etc.)
2. Check real-time notifications
3. Verify database connections
4. Then proceed with GKE deployment using `DEPLOYMENT.md`

---

## Quick Reference

```powershell
# Build
docker build -t mansaoferta:local .

# Deploy
kubectl apply -f k8s/local/

# Access
kubectl port-forward service/mansaoferta-service 3000:80

# Logs
kubectl logs -l app=mansaoferta -f

# Cleanup
kubectl delete -f k8s/local/
```
