# Alex's Portfolio Template

A minimal, fast personal website template built with [Eleventy](https://www.11ty.dev/) and deployed free to GitHub Pages. Sections for **about, experiences, projects, awards, people, photography, and quotes** — edit Markdown and JSON, push, done.

Features: build-time responsive images (drop any image, it's optimized automatically), scroll-to-navigate between pages, a scraper-resistant email link, and zero client-side framework.

## Quick start

1. Click **Use this template** (or clone the repo).
2. Install and run:

   ```bash
   npm install
   npm start      # dev server with live reload at http://localhost:8080
   ```

3. Edit content in `content/` (see the table below). Then build for production:

   ```bash
   npm run build  # outputs static site to _site/
   ```

> Requires Node 18+ (Node 22 recommended — it's what the deploy uses).

## Make it yours

Start here, in order:

1. **`content/_data/site.js`** — your name, tagline, social links, and the nav.
2. **`content/about.njk`** — your intro paragraphs and email.
3. The section folders under `content/` — replace the placeholder entries.

| To change… | Edit |
| --- | --- |
| Name / tagline / social links / nav | `content/_data/site.js` |
| About-page text + email | `content/about.njk` |
| Experiences | `.md` files in `content/experiences/` |
| Projects | `.md` files in `content/projects/` (order: `projects/order.json`) |
| Awards | `content/awards/list.json` (rich ones: a `.md` in `content/awards/`) |
| People | `content/people/people.json` |
| Quotes | `content/quotes/quotes.json` |
| Photography | drop images in `content/img/photography/`, list them in `content/photography/photography.json` |
| Favicon / logo mark | `src/img/favicon.svg`, `content/img/logo-placeholder.svg` |
| Colors / fonts / styling | `src/css/style.css` (CSS variables at the top) |

Every placeholder entry is a working example of a feature — read it, then replace it. The full authoring guide lives in **[`content/README.md`](content/README.md)**.

## Project structure

```
content/            ← everything you edit
  _data/site.js     ← global config (name, nav, social)
  about.njk         ← home/about page (hand-written)
  experiences/      ← one .md per experience
  projects/         ← one .md per project (+ order.json)
  awards/           ← list.json (+ optional .md for detailed awards)
  people/           ← people.json
  quotes/           ← quotes.json
  photography/      ← photography.json
  img/              ← images (referenced as /img/...)
src/                ← machinery — layouts, CSS, JS (rarely touched)
  _includes/        ← Nunjucks layouts
  css/style.css     ← all styles
  js/               ← scroll-nav, email, lethargy
.eleventy.js        ← Eleventy config (build pipeline)
.github/workflows/  ← GitHub Pages deploy
```

## Images

Drop any `.jpg`, `.png`, or `.webp` into `content/img/...` and reference it by its URL (`/img/...`). At build time [`@11ty/eleventy-img`](https://www.11ty.dev/docs/plugins/image/) generates optimized, responsive WebP variants automatically — no manual resizing or compression. SVGs are passed through untouched. The shipped placeholders are SVGs; replace them with your own images.

## Deployment (GitHub Pages, free)

1. **Enable Pages first (one-time):** in **Settings → Pages**, under *Build and deployment*, set **Source** to **GitHub Actions**. This must be done before the first run — the workflow can't create the Pages site for you (it fails with `Resource not accessible by integration` if Pages isn't enabled).
2. Push to `main`. The workflow in `.github/workflows/deploy.yml` builds and deploys automatically. (Already pushed before enabling? Just re-run the failed job from the **Actions** tab.)

**Path prefix:** the workflow defaults `PATH_PREFIX` to your repo name (`"/${{ github.event.repository.name }}/"`), correct for a **project repo** served at `https://username.github.io/<repo-name>/`. For a **user site** (`username.github.io`) or a **custom domain**, set it to `"/"` in the workflow.

<!-- This template's own demo lives at https://alexploopy.github.io/portfolio/ —
     a project repo, so the repo-name default above is exactly what it needs. -->

## Customizing the look

- **Colors and fonts:** the CSS variables at the top of `src/css/style.css`.
- **Remove scroll-to-navigate:** delete the two `<script>` tags for `lethargy.js` and `scroll-nav.js` in `src/_includes/base.njk` (the bottom chevron link keeps working).
- **Add a new section:** add a list page in `content/` that sets `collection`, mirror an existing section folder, and add a nav entry in `content/_data/site.js`. See `content/README.md`.

## Credits & license

Created by [Alex Tan](https://github.com/alexploopy/portfolio) — [GitHub](https://github.com/alexploopy) · [X](https://x.com/alexploopy). Design heavily inspired by [Josh Bradley](https://joshbradley.me/).

Licensed under [MIT](LICENSE) — use it freely. Attribution appreciated but not required.
