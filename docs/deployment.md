# Deployment & Hosting Guide

This guide describes how **EcoTrack AI** is compiled and deployed to **Google Cloud Run** for public access.

---

## 1. Hosting Technology

The application is deployed as a containerized service on **Google Cloud Run**, which provides:
* **Serverless Scaling**: Automatically scales container instances to zero when inactive, saving billing resources.
* **Security**: Sandbox isolation for container processes.
* **HTTPS**: Automatically configured SSL certificates.

## 2. Prerequisites for Cloud Deployment

* A Google Cloud Project (e.g. `adept-sentinel-495106-u2`).
* Active billing account associated with the project (to enable Artifact Registry and Cloud Build).
* **Google Cloud SDK (`gcloud`)** installed and authenticated:
  ```bash
  gcloud auth login
  gcloud config set project adept-sentinel-495106-u2
  ```

## 3. Configuration & Optimization

### Local Build Config (`next.config.mjs`)
The Next.js configuration is set to build statically where possible. We use `next.config.mjs` to allow Node.js to load configurations without a TypeScript transpilation step in production.

### Ignore Rules (`.gcloudignore`)
Due to difference in node container platforms, we ignore local lockfiles (`package-lock.json`) in **`.gcloudignore`**. This forces the Cloud Buildpacks compiler to run a fresh `npm install` on the build machine.

### Memory Configurations
Because Next.js has a relatively large startup footprint, default 512 MiB Cloud Run containers can trigger Out-of-Memory (OOM) crashes. Deployments configure container memory to **1 GiB** using `--memory=1Gi`.

## 4. Deployment Command

To deploy the application to Cloud Run, execute the following command from the project root:

```bash
gcloud run deploy ecotrack-ai \
  --source . \
  --project adept-sentinel-495106-u2 \
  --region us-central1 \
  --allow-unauthenticated \
  --memory=1Gi \
  --set-env-vars GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

* Replace `YOUR_GEMINI_API_KEY` with your actual Google AI Studio API key.
* The URL will be printed on screen upon successful deployment (e.g. `https://ecotrack-ai-36494818249.us-central1.run.app`).
