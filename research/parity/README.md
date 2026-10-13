# Website parity checklists

Each `<slug>.json` lists what the **real** retailer site has, captured on the date in the file:
header links, footer links, key pages, homepage sections and the site's department / sitemap
structure. `scripts/parity/check.mjs <slug>` scores the local clone against it and crawls the
clone for broken links. `scripts/parity/all.mjs` prints the table for every store.

A store passes when at least 80% of the checklist items pass **and** no internal link is broken.
Product inventory is out of scope: category and search pages reproduce the real layout,
navigation and copy, but only list products that the store's catalog evidence supports.

## File format

```json
{
  "store": "bestbuy",
  "real_home": "https://www.bestbuy.com/",
  "captured_at": "2026-10-13",
  "sources": ["https://www.bestbuy.com/", "..."],
  "home_path": "/",
  "sitemap_path": "/sitemap",
  "notes": "what could not be fetched and what stood in for it",
  "items": [
    { "kind": "header",  "label": "Top Deals", "real": "https://www.bestbuy.com/top-deals", "path": "/top-deals" },
    { "kind": "footer",  "label": "Check Order Status", "real": "...", "path": "/profile/ss/orderlookup" },
    { "kind": "page",    "label": "Store locator", "real": "...", "path": "/site/store-locator", "expect": ["Find a Store"] },
    { "kind": "home",    "label": "Deal of the Day block", "expect": ["Deal of the Day"] },
    { "kind": "sitemap", "label": "Appliances", "real": "...", "path": "/site/appliances/..." }
  ]
}
```

Paths are relative to the store's mount point. What each kind checks:

- `header` / `footer`: the clone's homepage has a link whose text contains `label` and points to
  `path`, and `path` renders a real page (HTTP 200, an `<h1>`, not a placeholder).
- `page`: `path` renders a real page containing every `expect` string.
- `home`: the homepage contains every `expect` string.
- `sitemap`: the clone's sitemap page (`sitemap_path`) links to `path` with that label, and `path` renders.
