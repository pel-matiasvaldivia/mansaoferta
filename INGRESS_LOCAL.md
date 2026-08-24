# Setting Up Ingress for Local Kubernetes (Docker Desktop)

## Overview
Docker Desktop Kubernetes doesn't come with an Ingress controller by default. We'll install **NGINX Ingress Controller** which is the most popular choice for local development.

---

## Step 1: Install NGINX Ingress Controller

```powershell
# Install NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
```

Wait for the controller to be ready (1-2 minutes):
```powershell
kubectl wait --namespace ingress-nginx `
  --for=condition=ready pod `
  --selector=app.kubernetes.io/component=controller `
  --timeout=120s
```

Verify installation:
```powershell
kubectl get pods -n ingress-nginx
```

You should see the `ingress-nginx-controller` pod running.

---

## Step 2: Update Service to ClusterIP

Since we're using Ingress, change the service type from NodePort to ClusterIP.

Edit `k8s/local/service.yaml` or use the updated version I created:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: mansaoferta-service
  namespace: default
spec:
  type: ClusterIP  # Changed from NodePort
  selector:
    app: mansaoferta
  ports:
  - port: 80
    targetPort: 3000
    protocol: TCP
    name: http
```

Apply the change:
```powershell
kubectl apply -f k8s/local/service.yaml
```

---

## Step 3: Create Ingress Resource

I've created `k8s/local/ingress.yaml` for you. Apply it:

```powershell
kubectl apply -f k8s/local/ingress.yaml
```

This creates an Ingress that routes traffic from `localhost` to your application.

---

## Step 4: Access Your Application

### Option A: Using localhost (Recommended)
```
http://localhost
```

The NGINX Ingress Controller listens on port 80 by default.

### Option B: Using a Custom Domain (Optional)

1. Edit your hosts file:
   - Windows: `C:\Windows\System32\drivers\etc\hosts`
   - Add this line:
     ```
     127.0.0.1 mansaoferta.local
     ```

2. Access via:
   ```
   http://mansaoferta.local
   ```

---

## Verify Ingress

```powershell
# Check Ingress status
kubectl get ingress

# Describe Ingress for details
kubectl describe ingress mansaoferta-ingress

# Check NGINX controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller
```

---

## Troubleshooting

### Port 80 Already in Use

If port 80 is already in use (common on Windows):

**Option 1**: Stop the service using port 80
```powershell
# Find what's using port 80
netstat -ano | findstr :80

# Stop IIS if it's running
Stop-Service -Name W3SVC
```

**Option 2**: Configure NGINX to use a different port

Edit the NGINX Ingress Controller service:
```powershell
kubectl edit service ingress-nginx-controller -n ingress-nginx
```

Change the port from 80 to 8080:
```yaml
ports:
- name: http
  port: 8080  # Changed from 80
  targetPort: http
```

Then access via: `http://localhost:8080`

### Ingress Not Working

1. **Check NGINX Controller**:
   ```powershell
   kubectl get pods -n ingress-nginx
   ```
   All pods should be `Running`.

2. **Check Ingress Events**:
   ```powershell
   kubectl describe ingress mansaoferta-ingress
   ```

3. **Check Service Endpoints**:
   ```powershell
   kubectl get endpoints mansaoferta-service
   ```
   Should show your pod IPs.

4. **Test Service Directly**:
   ```powershell
   kubectl port-forward service/mansaoferta-service 3000:80
   ```
   If this works but Ingress doesn't, the issue is with Ingress configuration.

---

## Complete Deployment with Ingress

```powershell
# 1. Install NGINX Ingress Controller (one-time)
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# 2. Wait for controller to be ready
kubectl wait --namespace ingress-nginx `
  --for=condition=ready pod `
  --selector=app.kubernetes.io/component=controller `
  --timeout=120s

# 3. Deploy your application
kubectl apply -f k8s/local/configmap.yaml
kubectl apply -f k8s/local/secret.yaml
kubectl apply -f k8s/local/deployment.yaml
kubectl apply -f k8s/local/service.yaml
kubectl apply -f k8s/local/ingress.yaml

# 4. Verify
kubectl get pods
kubectl get ingress

# 5. Access
# Open browser to http://localhost
```

---

## Ingress vs NodePort vs Port-Forward

| Method | URL | Use Case |
|--------|-----|----------|
| **Ingress** | `http://localhost` | Production-like setup, multiple services |
| **NodePort** | `http://localhost:30000` | Simple access, single service |
| **Port-Forward** | `http://localhost:3000` | Quick testing, debugging |

---

## Advanced: SSL/TLS for Local Development

If you want HTTPS locally:

1. **Generate self-signed certificate**:
   ```powershell
   # Using OpenSSL (install from https://slproweb.com/products/Win32OpenSSL.html)
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 `
     -keyout tls.key -out tls.crt `
     -subj "/CN=localhost"
   ```

2. **Create Kubernetes secret**:
   ```powershell
   kubectl create secret tls mansaoferta-tls `
     --cert=tls.crt --key=tls.key
   ```

3. **Update Ingress** to use TLS (I can create this if you want).

---

## Cleanup

```powershell
# Delete your application
kubectl delete -f k8s/local/

# Delete NGINX Ingress Controller (optional)
kubectl delete -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
```

---

## Benefits of Using Ingress Locally

✅ Matches production setup (GKE uses Ingress)  
✅ Clean URLs (no port numbers)  
✅ Path-based routing (if you add more services)  
✅ SSL/TLS support  
✅ Better for testing microservices architecture
