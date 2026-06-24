# Content

Everything in this folder is **editable content**. (The site's machinery —
layouts, CSS, JS — lives in `../src/` and normally isn't touched.) After editing,
run `npm start` from the project root to preview at http://localhost:8080.

## Where to edit what

| You want to change… | Edit |
| --- | --- |
| Your name / tagline / social links / nav order | `_data/site.js` |
| About-page text | `about.njk` (the paragraphs inside `.prose`) |
| An experience | add/edit a `.md` file in `experiences/` |
| A project | add/edit a `.md` file in `projects/` |
| Project order | `projects/order.json` (filenames, top-to-bottom) |
| An award | add/edit an entry in `awards/list.json` (rich ones: a `.md` in `awards/`) |
| The people list | `people/people.json` |
| The quotes list | `quotes/quotes.json` |
| Photography images | drop files in `img/photography/`, list them in `photography/photography.json` |

Images live under `img/`, organized by where they're used:

    img/
      experiences/
        logos/             # company logos (logo: front matter)
        <company>/         # detail-page images, e.g. example-company/photo-1.webp
      projects/<project>/  # project detail-page images (create as needed)
      photography/         # the photography grid
      <placeholder>.svg    # the shipped placeholders (replace with your own)

Reference an image by its URL, which mirrors its path: a file at
`img/experiences/example-company/photo-1.webp` is referenced as
`/img/experiences/example-company/photo-1.webp`.

Drop any `.jpg`/`.jpeg`/`.png`/`.webp` in and reference it — the build
(`@11ty/eleventy-img`) generates optimized, responsive WebP variants
automatically. SVGs are passed through untouched.

## Adding an entry (experiences / projects)

Create a Markdown file in the section folder:

    ---
    title: Example Company
    date: 2021-11-21
    description: A one-line summary, can include a [link](https://example.com).
    location: Your City                                # optional
    logo: /img/experiences/logos/example-company.webp  # optional — small icon shown inline before the title
    ---

    Body paragraphs (Markdown). It auto-appears in the list (newest first) and
    gets its own detail page.

### Where links work

Use Markdown link syntax — `[text](https://…)` — in any of these (no raw `<a>`):

- **Subtitles** (`description`) on every list.
- **Meta text** on experiences: `role` and `location` (quote a value that starts
  with `[`, e.g. `location: "[Your City](https://example.com)"`, so YAML doesn't
  see a list).
- **Detail bodies** — normal Markdown: prose, the `<cite>` of a `>` pull-quote,
  and figure captions (the image "title").
- **Quotes** — both `text` and `attribution` in `quotes/quotes.json`.

Whole-item links (the title itself) work via dedicated fields, each shown with a
`↗`/`→`: experiences and awards use `website`; projects use `website` for the
default/primary link (the detail-page title links there, just like experiences)
plus `links` for additional ones (GitHub/Devpost/live); and `people` entries use
`url` + extra labelled `links`. The About page is hand-written HTML, so it uses
`<a href>` directly.

**Projects don't use `date`.** Their order is set explicitly in
`projects/order.json` — an array of project filenames (without `.md`) listed
top-to-bottom. Reorder them by editing that list; a project not listed falls to
the end (alphabetically by title). Everything else (experiences, awards) is
newest-first by date.

    [
      "project-one",
      "project-two",
      "project-three"
    ]

**Project links.** Add a `links` list to a project's front matter for external
links (GitHub, Devpost, live site, …) — each `{ label, url }`. They render as a
row of `label ↗` links on both the projects list and the project's detail page:

    ---
    title: Project One
    website: https://example.com               # default link (the title)
    links:
      - label: GitHub
        url: https://github.com/yourhandle/project-one
    ---

**Optional logo:** put an image in `img/experiences/logos/` and set
`logo: /img/experiences/logos/<file>` in the front matter. It renders as a small
icon inline before the title (in both the list and the detail page). Omit `logo`
for no icon. Works for experiences and projects.

**Experiences** use a two-column layout — company (`title`) + date range on top,
`role` + `location` below:

    ---
    title: Example Company     # company name (top-left)
    role: Your Role            # bottom-left
    location: City, Country    # bottom-right
    dates: 2022 - 2023         # optional free-form date range shown top-right (e.g. "2024 - Present")
    date: 2022-09-01           # optional ISO date — controls list ordering only (not shown)
    logo: /img/experiences/logos/example-company.webp
    ---

    > A blockquote renders as a styled pull-quote.

    ![alt text](/img/experiences/example-company/photo-1.webp "Optional caption")

The caption (the quoted image title) supports inline Markdown, so links work:
`"Photo by [Jane](https://example.com)"`. Use Markdown link syntax, not raw
`<a href="…">` — the embedded quotes would break the caption.

**Awards** are driven by `awards/list.json` (an ordered array; reorder by moving
entries). Most are simple one-liners — `{ "title": "...", "description": "..." }`
(`description` optional, supports inline Markdown links). For an award that
deserves a full writeup, add a `.md` file in `awards/` (same front matter as
experiences/projects, plus a Markdown body) and reference it from the array with
`{ "ref": "<filename-without-.md>" }` — it then gets its own detail page and the
array positions it in the list.

## Photography

Put images in `img/photography/` and reference them from `photography/photography.json`:

    [
      { "src": "/img/photography/my-photo.webp", "alt": "Description" }
    ]

Images are served from `/img/photography/...` (any size — the grid arranges them
automatically). `src` paths use that URL even though the files live here.

## People / quotes

`people/people.json`:

    [
      { "name": "Ada Lovelace", "url": "https://example.com",
        "links": [{ "label": "wikipedia", "url": "https://..." }] }
    ]

`quotes/quotes.json`:

    [
      { "text": "The quote.", "attribution": "Author" }
    ]

Section data lives in each section's folder (only `_data/site.js` is global).

## A whole new section

Add a list page here (e.g. `talks.njk`) that sets `collection`, mirror an
existing section folder, and add a nav entry in `_data/site.js`.
