// Source-backed catalog allowlist; purchase simulation does not establish retailer stock.
export const CATALOG_EVIDENCE = {
  "gta-vi": {
    "source_url": "https://store.rockstargames.com/game/buy-gta-vi",
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
      "physical_skus",
      "digital_linkouts",
      "purchase_limit"
    ],
    "reviewed_at": "2026-10-06",
    "supporting_evidence": [
      "research/rockstar-store.json",
      "research/fidelity-2026-10-06/specialist-retail.md"
    ],
    "capture_method": "public-html"
  }
}
