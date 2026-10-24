# Hosting Life Abroad Kit alongside a Lovable website

The existing main website is hosted on Lovable. This app is a separate repository; pushing this repository does not add routes to the existing Lovable project.

## Recommended first launch: separate subdomain

Deploy `dist/` to a static host and attach a subdomain such as `life-abroad-kit.jameshutchinsonlanguages.com`. Keep the existing main website on Lovable and add a normal link to the kit. This avoids changes to the main website's routing. The exact subdomain and host must be selected before DNS changes.

For a root/subdomain deployment, create an untracked `.env.local` file:

```dotenv
APP_BASE_PATH=/
```

Then run `npm run build`. Configure the host to publish `dist/` with HTTPS. Local browser progress belongs to that final origin, so choose it before launch.

## Intended path: /life-abroad-kit/

The default Vite base is `/life-abroad-kit/`. Routes use URL fragments, e.g. `/life-abroad-kit/#scenario/doctor`, so direct links and refreshes require only the kit's index document, not server rewrites for every scenario.

To serve this separate app at `https://jameshutchinsonlanguages.com/life-abroad-kit/`, either:

1. Integrate the app into the existing main website's code and hosting pipeline, carefully preserving its routes and styling; or
2. Configure a reverse proxy/CDN in front of the domain which sends `/life-abroad-kit/*` to this app and other requests to the Lovable site. This requires checking domain control, current DNS, Lovable's proxy requirements, TLS and cache behaviour. DNS alone cannot route by URL path.

Do not assume connecting a custom domain to a separate project makes it available at a path inside another project. No such infrastructure changes are included here.

Before choosing a path integration, obtain access to the main website's repository or its hosting configuration; no secret values should be committed. Preserve the existing site and Voco infrastructure.

## GitHub Pages preview (optional)

GitHub repository: `https://github.com/hutchy9999/Life-Abroad-Kit`.

Pages can serve a static Vite build. For the default repository URL `https://hutchy9999.github.io/Life-Abroad-Kit/`, use the case-sensitive base `/Life-Abroad-Kit/` in `.env.local` before building. Enable Pages with an appropriate GitHub Actions build/deploy workflow only when publishing is authorised. This repo's CI validates tests/builds and does not deploy.

For a custom subdomain on Pages, use `/` as the base and follow GitHub's domain verification and HTTPS instructions. Never change the main domain's DNS to Pages while it still hosts the main Lovable website.

## Host-agnostic production build

- Install: `npm ci`
- Test: `npm test`
- Build: `npm run build`
- Output: `dist`
- Backend/environment secrets: none
- Runtime: static HTML, CSS and JS
- Audio: browser/OS speech synthesis
- Progress: browser localStorage

Set `APP_BASE_PATH` using the build environment or `.env.local`; build after changing it. The app uses fragment links to avoid host-specific SPA fallback requirements. Serve `index.html` at the chosen base directory, and return JS/CSS assets with their correct MIME types. A request outside the chosen base need not be rewritten to the app.

## Reference documentation

- Lovable custom domains and reverse proxies: https://docs.lovable.dev/features/custom-domain
- Lovable hosting ownership: https://docs.lovable.dev/tips-tricks/deployment-hosting-ownership
- Vite static deployment: https://vite.dev/guide/static-deploy.html
- GitHub Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
