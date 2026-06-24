const { eleventyImageTransformPlugin } = require("@11ty/eleventy-img");
const fs = require("fs");
const path = require("path");

// Read a JSON file relative to this config, fresh each call (so `--serve`
// picks up edits), returning `fallback` if it's missing or invalid.
const readJSON = (rel, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, rel), "utf8"));
  } catch {
    return fallback;
  }
};

module.exports = function (eleventyConfig) {
  // Deployment path prefix. "/" for a user site (username.github.io) or a custom
  // domain; "/<repo>/" for a project repo (set by the deploy workflow). Normalized
  // to start and end with "/" so it can be concatenated safely below.
  const raw = process.env.PATH_PREFIX || "/";
  const PATH_PREFIX = ("/" + raw + "/").replace(/\/+/g, "/");

  // Section data lives next to each section, not in _data (only site.js is a
  // true global). These expose the same variable names the templates already
  // use, sourced from each section's own folder. Watched so edits live-reload.
  const SECTION_DATA = {
    photography: "content/photography/photography.json",
    people: "content/people/people.json",
    quotes: "content/quotes/quotes.json",
    awards: "content/awards/list.json",
    projectOrder: "content/projects/order.json",
  };
  for (const [name, rel] of Object.entries(SECTION_DATA)) {
    eleventyConfig.addGlobalData(name, () => readJSON(rel, []));
    eleventyConfig.addWatchTarget(rel);
  }
  // Build-time responsive images: rewrite every <img> in the output HTML into
  // responsive WebP variants. Just drop any .jpg/.png/.webp into content/img/
  // and reference it (e.g. /img/projects/foo/shot.webp) — the build optimizes
  // it automatically. SVGs are passed through untouched (vector marks must not
  // be rasterized). Tune widths/quality here.
  //
  // urlPath carries PATH_PREFIX so generated <img> URLs resolve under a project
  // repo's sub-path (e.g. /portfolio/img/...), while outputDir keeps the files at
  // _site/img/ (served at the same sub-path). Reference images with a bare
  // "/img/..." path (NOT piped through `| url`) — the transform adds the prefix.
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    extensions: "html",
    formats: ["svg", "webp"],
    widths: [400, 800, 1200, 1600, "auto"],
    urlPath: PATH_PREFIX + "img/",
    outputDir: "_site/img/",
    defaultAttributes: {
      loading: "lazy",
      decoding: "async",
      sizes: "(max-width: 700px) 100vw, 700px",
    },
    sharpWebpOptions: { quality: 76 },
    svgShortCircuit: true,
  });

  // Static assets / machinery. Image sources live under content/img/ so their
  // on-disk paths mirror their /img/ URLs (required for the image transform to
  // resolve absolute <img src="/img/..."> references). The transform emits
  // optimized variants; this passthrough copies originals and SVGs verbatim.
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/img": "img" });
  eleventyConfig.addPassthroughCopy({ "content/img": "img" });

  // The content authoring guide is documentation, not a page.
  eleventyConfig.ignores.add("content/README.md");

  // "2021-11-21" -> "Nov 21, 2021" (force UTC to avoid off-by-one).
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return new Date(dateObj).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  });

  // Section display order, shared by the list page and scroll navigation so
  // both agree. Projects follow an explicit, hand-maintained order list
  // (content/projects/order.json — an array of project filenames without
  // ".md"); anything not listed falls to the end, alphabetically by title.
  // Every other section is newest-first by date.
  const orderEntries = (items, name, order) => {
    const arr = (items || []).slice();
    if (name === "projects") {
      const ord = order || [];
      const rank = (item) => {
        const i = ord.indexOf(item.fileSlug);
        return i === -1 ? Infinity : i;
      };
      return arr.sort((a, b) => {
        const ra = rank(a);
        const rb = rank(b);
        if (ra !== rb) return ra - rb;
        return String(a.data.title).localeCompare(String(b.data.title));
      });
    }
    return arr.sort((a, b) => b.date - a.date);
  };
  eleventyConfig.addFilter("order", orderEntries);

  // Resolve a `{ "ref": "<slug>" }` awards-list entry to its collection item
  // (the .md file content/awards/<slug>.md) so detailed awards can be ordered
  // from list.json while their content lives in the .md. Returns undefined if
  // no match (the template then skips the entry).
  eleventyConfig.addFilter("findBySlug", (collection, slug) =>
    (collection || []).find((item) => item.fileSlug === slug)
  );

  // Per-page scroll navigation targets. Computed at render time (NOT in
  // eleventyComputed, where `collections` is not yet fully built).
  // Returns root-relative URLs ("" = stop); the template applies `| url`.
  eleventyConfig.addFilter("scrollNav", (url, collections, active, nav, projectOrder) => {
    if (!url) return { next: "", prev: "" };

    const navUrls = (nav || []).map((n) => n.url);
    const navIdx = navUrls.indexOf(url);

    // Main nav page: linear, stop at both ends.
    if (navIdx !== -1) {
      return {
        prev: navIdx > 0 ? navUrls[navIdx - 1] : "",
        next: navIdx < navUrls.length - 1 ? navUrls[navIdx + 1] : "",
      };
    }

    // Detail page: traverse within its section in display order, returning to
    // the section list at either boundary.
    const listUrl = "/" + active + "/";
    const items = orderEntries((collections && collections[active]) || [], active, projectOrder);
    const i = items.findIndex((item) => item.url === url);
    if (i === -1) return { next: "", prev: "" };

    return {
      prev: i > 0 ? items[i - 1].url : listUrl,
      next: i < items.length - 1 ? items[i + 1].url : listUrl,
    };
  });

  // Standalone Markdown images become <figure> with an optional <figcaption>
  // (from the image title). Inline images stay plain <img>. No dependency.
  // We also capture the configured markdown-it instance so the `mdInline`
  // filter below renders short data-driven strings (quote attributions, etc.)
  // with the same inline Markdown rules as the page body.
  let mdLib;
  eleventyConfig.amendLibrary("md", (md) => {
    mdLib = md;
    md.core.ruler.before("linkify", "image_figures", (state) => {
      const tokens = state.tokens;
      for (let i = 1; i < tokens.length - 1; i++) {
        const inline = tokens[i];
        const open = tokens[i - 1];
        const close = tokens[i + 1];
        if (inline.type !== "inline") continue;
        if (open.type !== "paragraph_open" || close.type !== "paragraph_close")
          continue;
        if (!inline.children || inline.children.length !== 1) continue;
        const image = inline.children[0];
        if (image.type !== "image") continue;

        open.type = "figure_open";
        open.tag = "figure";
        open.attrSet("class", "figure");
        close.type = "figure_close";
        close.tag = "figure";

        const title = image.attrGet("title");
        if (title) {
          const Token = state.Token;
          const capOpen = new Token("figcaption_open", "figcaption", 1);
          const capClose = new Token("figcaption_close", "figcaption", -1);
          // Render the caption as inline Markdown so links and emphasis work —
          // e.g. `[text](url)` becomes a real <a>. parseInline returns a single
          // block token whose `.children` are the parsed inline tokens; splice
          // them between the figcaption open/close. (Note: the caption is the
          // image title, delimited by quotes, so use Markdown link syntax —
          // not raw <a href="…"> — to avoid breaking the title's quoting.)
          const parsed = md.parseInline(title, state.env);
          const capChildren = (parsed[0] && parsed[0].children) || [];
          inline.children.push(capOpen, ...capChildren, capClose);
          image.attrs = image.attrs.filter((a) => a[0] !== "title");
        }
      }
    });
  });

  // Render a short string as inline Markdown (no wrapping <p>), so data-driven
  // fields can contain links/emphasis — e.g. a quote attribution
  // "Your Name via [X](https://…)". Use with `| safe`. Falls back to the raw
  // string if the library isn't ready yet.
  eleventyConfig.addFilter("mdInline", (s) => {
    if (!s) return "";
    return mdLib ? mdLib.renderInline(String(s)) : String(s);
  });

  return {
    dir: {
      input: "content",
      includes: "../src/_includes",
      data: "_data",
      output: "_site",
    },
    // Set per repo type at deploy time via env (see deploy task). Defaults to root.
    pathPrefix: PATH_PREFIX,
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
