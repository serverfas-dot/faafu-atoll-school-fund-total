# Faafu Atoll School Fund Total

A public status page that shows the current fund total for Faafu Atoll School, with a protected admin area to update the total, keep a backup history, and restore earlier totals.

## Setup

1. Install dependencies with `npm install`.
2. Create a `.env` file with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Run `npm run dev` to start the app locally.

## Automatic deployment

Every push to the `main` branch builds the site and publishes it with GitHub Pages (see `.github/workflows/deploy.yml`).

One-time setup on GitHub:

1. Settings > Pages > Build and deployment > Source: choose **GitHub Actions**.
2. Settings > Secrets and variables > Actions > New repository secret: add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with the same values the app already uses.
3. Push to `main` (or run the "Deploy to GitHub Pages" workflow manually). The site is published at `https://<your-github-username>.github.io/faafu-atoll-school-fund-total/`, and the admin page is at the same address with `/admin` added.
