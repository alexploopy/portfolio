/*
  ─────────────────────────────────────────────────────────────────────────────
  Site-wide settings (the live config is below).

  Fields:
    Required:  name     — your name; home <h1> and the browser-tab <title> (every page)
               tagline  — short tagline for the site
               nav      — sidebar links AND the order pages scroll through;
                          each entry is { key, label, url } where:
                            key   — matches a page's `active:` to highlight the link
                            label — text shown in the sidebar
                            url   — link target (root-relative)
               social   — links rendered on the About page; each entry is
                          { label, url } where:
                            label — link text
                            url   — link target

  Reference shape:

    module.exports = {
      name: "Your Name",
      tagline: "A short tagline about you",
      nav: [
        { key: "about", label: "about", url: "/" },
      ],
      social: [
        { label: "X", url: "https://x.com/yourhandle" },
      ],
    };
  ─────────────────────────────────────────────────────────────────────────────
*/
module.exports = {
  name: "Your Name",
  tagline: "A short tagline about you",
  nav: [
    { key: "about", label: "about", url: "/" },
    { key: "experiences", label: "experiences", url: "/experiences/" },
    { key: "projects", label: "projects", url: "/projects/" },
    { key: "awards", label: "awards", url: "/awards/" },
    { key: "people", label: "people", url: "/people/" },
    { key: "photography", label: "photography", url: "/photography/" },
    { key: "quotes", label: "quotes", url: "/quotes/" },
  ],
  social: [
    { label: "X", url: "https://x.com/yourhandle" },
    { label: "GitHub", url: "https://github.com/yourhandle" },
    { label: "LinkedIn", url: "https://linkedin.com/in/yourhandle" },
  ],
};
