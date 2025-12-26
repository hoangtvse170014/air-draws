# Air Draw

Prototype playground for drawing in the air with a fingertip, capturing the trace, and generating polished AI imagery from it.

## Project Layout

- `apps/web` – browser UI: camera feed, hand tracking overlay, drawing canvas, and a panel to trigger AI generation.
- `services/ai-api` – backend API that accepts sketches, performs lightweight recognition, and delegates to diffusion models.
- `models` – research artifacts (notebooks, exported checkpoints) kept out of the runtime packages.
- `scripts` – utility scripts for dataset preparation and model conversions.
- `infra` – deployment helpers such as Docker Compose and Kubernetes manifests.
- `.github/workflows` – CI configuration for linting and tests.

## Getting Started

```sh
pnpm install
pnpm dev:web   # start the front-end (Vite/React placeholder)
pnpm dev:api   # start the API server (Express placeholder)
```

To activate the real Stability diffusion pipeline, provide an API key:

```sh
cd services/ai-api
setx STABILITY_KEY "your-stability-key"  # PowerShell example
```

Without a key the backend falls back to placeholder images.

