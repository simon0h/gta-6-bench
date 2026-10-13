import { esc } from '../../lib/html.js'
import { searchImages } from './search-reference.js'

// The live query-empty page recommends inspiration separately from product results.
export function emptySearch(base, query) {
  const inspiration = searchImages.slice(0, 12)
  const columns = [[0, 6, 10], [1, 4, 8], [2, 7, 11], [3, 5, 9]]
  return `<section class="ik-search-empty" aria-label="Search results"><p class="sr-only">Showing results for "${esc(query)}". We found 0 products and 0 content results.</p><h1>There are no results for <strong>"${esc(query)}"</strong></h1><p>Try again using a different spelling or keywords.</p><section class="ik-search-inspiration"><h2>More inspiration like this</h2><div class="ik-inspiration-grid">${columns.map(column => `<div>${column.map(i => `<a href="${base}/ideas" aria-label="Explore home inspiration"><img src="${inspiration[i].src}" alt="${esc(inspiration[i].alt)}" class="${inspiration[i].square ? 'square' : 'portrait'}"${i > 3 ? ' loading="lazy"' : ''}></a>`).join('')}</div>`).join('')}</div></section><section class="ik-search-categories" data-category-browser><h2>Recommended categories</h2><div class="ik-category-rail" data-category-rail tabindex="0" aria-label="Recommended categories">${searchImages.slice(12).map(image => `<a href="${base}/us/en/search/?q=${encodeURIComponent(image.query)}"><img src="${image.src}" alt="" loading="lazy"><div><p>Category</p><h3>${esc(image.title)}</h3><span aria-hidden="true">→</span></div></a>`).join('')}</div><div class="ik-rail-controls" hidden><button type="button" data-rail-direction="-1" aria-label="Previous categories">←</button><button type="button" data-rail-direction="1" aria-label="More categories">→</button></div></section></section>`
}
