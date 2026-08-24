# GKE Autopilot Deployment Guide

## Prerequisites

### Required Tools
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) (`gcloud` CLI)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Docker](https://docs.docker.com/get-docker/)

### Google Cloud Setup
1. Create a Google Cloud Project
2. Enable billing
3. Enable required APIs:
   ```bash
   gcloud services enable container.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   ```

---

## Step 1: Configure Environment Variables

### Update ConfigMap
Edit `k8s/configmap.yaml`:
```yaml
NEXT_PUBLIC_SUPABASE_URL: "https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_BASE_URL: "https://mansaoferta.com.ar"
```

### Create Secret
Encode your Supabase anon key:
```bash
echo -n 'your-supabase-anon-key' | base64
```

Update `k8s/secret.yaml` with the base64 encoded value.

---

## Step 2: Build and Push Docker Image

### Set Project ID
```bash
export PROJECT_ID=your-gcp-project-id
export IMAGE_NAME=mansaoferta
export IMAGE_TAG=latest
```

### Build Docker Image
```bash
docker build -t $IMAGE_NAME:$IMAGE_TAG .
```

### Test Locally (Optional)
```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL="your_url" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="your_key" \
  $IMAGE_NAME:$IMAGE_TAG
```

Visit http://localhost:3000 to verify.

### Tag and Push to Docker Hub
```bash
docker tag $IMAGE_NAME:$IMAGE_TAG mansaoferta/app:$IMAGE_TAG
docker push mansaoferta/app:$IMAGE_TAG
```

---

## Step 3: Create GKE Autopilot Cluster

### Create Cluster
```bash
gcloud container clusters create-auto mansaoferta-cluster \
  --region=us-central1 \
  --project=$PROJECT_ID
```

This takes 5-10 minutes.

### Configure kubectl
```bash
gcloud container clusters get-credentials mansaoferta-cluster \
  --region=us-central1 \
  --project=$PROJECT_ID
```

### Verify Connection
```bash
kubectl cluster-info
kubectl get nodes
```

---

## Step 4: Reserve Static IP (for Ingress)

```bash
gcloud compute addresses create mansaoferta-ip \
  --global \
  --project=$PROJECT_ID
```

Get the IP address:
```bash
gcloud compute addresses describe mansaoferta-ip --global
```

**Important**: Point your domain DNS A record to this IP address.

---

## Step 5: Update Kubernetes Manifests

### Update Deployment Image
Edit `k8s/deployment.yaml`:
```yaml
image: mansaoferta/app:latest
```

Replace `YOUR_PROJECT_ID` with your actual project ID.

---

## Step 6: Deploy to Kubernetes

### Apply Manifests
```bash
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

### Verify Deployment
```bash
# Check pods
kubectl get pods

# Check deployment
kubectl get deployment mansaoferta

# Check service
kubectl get service mansaoferta-service

# Check ingress
kubectl get ingress mansaoferta-ingress
```

Wait for pods to be in `Running` state.

---

## Step 7: Monitor and Verify

### Check Pod Logs
```bash
kubectl logs -l app=mansaoferta --tail=100 -f
```

### Check Pod Status
```bash
kubectl describe pod -l app=mansaoferta
```

### Test Service Internally
```bash
kubectl port-forward service/mansaoferta-service 8080:80
```

Visit http://localhost:8080

---

## Step 8: Configure Domain and SSL

### DNS Configuration
1. Go to your domain registrar
2. Add an A record:
   - Name: `@` (or `www`)
   - Type: `A`
   - Value: `[Static IP from Step 4]`

### Wait for SSL Certificate
Google-managed certificates take 15-60 minutes to provision.

Check status:
```bash
kubectl describe managedcertificate mansaoferta-cert
```

Look for `Status: Active`

---

## Step 9: Access Your Application

Once DNS propagates and SSL is active:
- https://mansaoferta.com.ar

---

## Updating the Application

### Build New Image
```bash
docker build -t mansaoferta/app:v2 .
docker push mansaoferta/app:v2
```

### Update Deployment
```bash
kubectl set image deployment/mansaoferta \
  mansaoferta=mansaoferta/app:v2
```

### Rollout Status
```bash
kubectl rollout status deployment/mansaoferta
```

### Rollback (if needed)
```bash
kubectl rollout undo deployment/mansaoferta
```

---

## Scaling

GKE Autopilot handles scaling automatically, but you can adjust replicas:

```bash
kubectl scale deployment mansaoferta --replicas=3
```

---

## Monitoring

### View Logs
```bash
kubectl logs -l app=mansaoferta --tail=100 -f
```

### View Events
```bash
kubectl get events --sort-by='.lastTimestamp'
```

### Google Cloud Console
- Navigate to **Kubernetes Engine** → **Workloads**
- View metrics, logs, and health

---

## Troubleshooting

### Pods Not Starting
```bash
kubectl describe pod -l app=mansaoferta
kubectl logs -l app=mansaoferta
```

Common issues:
- Image pull errors (check GCR permissions)
- Environment variable errors
- Resource limits too low

### Ingress Not Working
```bash
kubectl describe ingress mansaoferta-ingress
```

Common issues:
- DNS not propagated (wait 24-48 hours)
- SSL certificate not ready (wait 15-60 minutes)
- Static IP not reserved

### Health Check Failures
Check liveness/readiness probes:
```bash
kubectl describe pod -l app=mansaoferta
```

Adjust probe settings in `k8s/deployment.yaml` if needed.

---

## Cost Optimization

- **Autopilot**: Automatically optimizes resource usage
- **Resource Requests**: Set appropriate CPU/memory in deployment.yaml
- **Monitoring**: Use Google Cloud Monitoring to track costs
- **Cleanup**: Delete unused resources

---

## Cleanup (Delete Everything)

```bash
# Delete Kubernetes resources
kubectl delete -f k8s/

# Delete cluster
gcloud container clusters delete mansaoferta-cluster \
  --region=us-central1 \
  --project=$PROJECT_ID

# Delete static IP
gcloud compute addresses delete mansaoferta-ip --global

# Delete Docker images
docker rmi mansaoferta/app:$IMAGE_TAG
```

---

## Security Best Practices

1. **Secrets Management**: Use Google Secret Manager for production
2. **Network Policies**: Implement network policies for pod isolation
3. **RBAC**: Configure role-based access control
4. **Image Scanning**: Enable vulnerability scanning in GCR
5. **Regular Updates**: Keep dependencies and base images updated

---

## Next Steps

- Set up CI/CD with GitHub Actions
- Configure monitoring and alerting
- Implement backup strategies
- Set up staging environment
- Configure custom domain email

---

## Support

For issues:
1. Check pod logs: `kubectl logs -l app=mansaoferta`
2. Check events: `kubectl get events`
3. Review GKE documentation: https://cloud.google.com/kubernetes-engine/docs
