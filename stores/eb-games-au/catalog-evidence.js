// Source-backed catalog allowlist; purchase simulation does not establish retailer stock.
export const CATALOG_EVIDENCE = {
  "330056": {
    "source_url": "https://www.ebgames.com.au/product/ps5/330056-grand-theft-auto-vi",
    "captured_at": "2026-10-06",
    "evidence_path": "research/fidelity-2026-10-06/specialist-inventory.md",
    "availability": "preorder",
    "purchase": "simulated",
    "facts": [
      "title",
      "platform",
      "edition",
      "format",
      "price",
      "release_date",
      "deposit"
    ],
    "reviewed_at": "2026-10-06",
    "supporting_evidence": [
      "research/eb-games-au.json",
      "research/fidelity-2026-10-06/specialist-retail.md"
    ],
    "capture_method": "public-listing-metadata",
    "notes": "Official indexed product listing supports preorder price and deposit; browser checkout was blocked. Purchase remains a local simulation."
  },
  "330060": {
    "source_url": "https://www.ebgames.com.au/product/xbox-series-x/330060-grand-theft-auto-vi",
    "captured_at": "2026-10-06",
    "evidence_path": "research/fidelity-2026-10-06/specialist-inventory.md",
    "availability": "preorder",
    "purchase": "simulated",
    "facts": [
      "title",
      "platform",
      "edition",
      "format",
      "price",
      "release_date",
      "deposit"
    ],
    "reviewed_at": "2026-10-06",
    "supporting_evidence": [
      "research/eb-games-au.json",
      "research/fidelity-2026-10-06/specialist-retail.md"
    ],
    "capture_method": "public-listing-metadata",
    "notes": "Official indexed product listing supports preorder price and deposit; browser checkout was blocked. Purchase remains a local simulation."
  }
}
