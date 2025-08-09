# Dream → Reality

Full-stack app to place uploaded photos into AI-generated scenes.

## Quick local run (requires Docker)
1. Build image:
   docker build -t dream-reality .

2. Run container:
   docker run -p 4000:4000 -e OPENAI_API_KEY="sk-..." dream-reality

Open http://localhost:4000

## Deploy to Render
1. Push repo to GitHub.
2. Create a new Web Service on Render, select Docker, and link repo.
3. Add environment variable OPENAI_API_KEY in Render dashboard.
4. Deploy.

## Notes
- You can replace the OpenAI images endpoint with another provider if needed.
- `rembg` runs offline but requires binary/native deps; Dockerfile attempts to include them.
