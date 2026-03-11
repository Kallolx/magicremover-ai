# Deploy to Vercel via GitHub

## Quick Steps:

1. **Push to GitHub:**
```bash
git add .
git commit -m "Frontend ready for deployment"
git push origin main
```

2. **Connect to Vercel:**
- Go to https://vercel.com
- Click "Add New Project"
- Import your GitHub repository: `Kallolx/magicremover-ai`
- Framework will auto-detect as "Vite"

3. **Add Environment Variable in Vercel:**
- In Vercel project settings → Environment Variables
- Add: `VITE_BACKEND_URL` = `https://nottingham-night-schema-aviation.trycloudflare.com`
- (Update this URL whenever you restart cloudflared tunnel)

4. **Deploy:**
- Click "Deploy"
- Done! Your frontend will be live at `https://magicremover-ai.vercel.app`

## Update Backend URL Later:

When your cloudflared tunnel URL changes:
1. Go to Vercel project → Settings → Environment Variables
2. Edit `VITE_BACKEND_URL` to new tunnel URL
3. Trigger a new deployment (or it will auto-deploy on next git push)

## Local Development:

```bash
bun run dev
```

Make sure `.env.local` has your current tunnel URL.
