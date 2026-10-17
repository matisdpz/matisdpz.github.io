# matisdpz.github.io

Personal portfolio, built with [Astro](https://astro.build) and deployed to GitHub Pages:
<https://matisdpz.github.io>

## Development

Requirements: Node 22.12 or later.

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # type check (astro check) then static build into dist/
npm run preview   # serve dist/ locally
```

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`, which builds the site and
publishes it with GitHub Pages (repository settings: Pages source = GitHub Actions).
