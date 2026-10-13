import { randomUUID } from 'node:crypto'
import { esc, money } from '../../lib/html.js'
import { GAME } from '../../lib/catalog.js'
import { retailState } from '../../lib/retail-state.js'
import { products, bySku, media } from './catalog.js'

const won = value => money(value, 'KRW')
const text = value => typeof value === 'string' ? value.trim() : ''
export const validQty = value => /^[1-4]$/.test(String(value)) ? Number(value) : null
export function canonicalLine(product, qty) {
  return product.kind ? {kind:'other', sku:product.sku, title:product.title, qty, unit_price:product.price} : {sku:product.sku, title:GAME.title, platform:product.platform, edition:'standard', format:'code-in-box', qty, unit_price:89800}
}
export function invalidateCheckout(req) {
  req.store.checkout = {}
  delete req.store.checkoutCompleted
}
export function selectedCart(req) {
  return req.store.cart.filter(item => !Array.isArray(req.store.selectedSkus) || req.store.selectedSkus.includes(item.sku))
}
export function purchaseLines(req) {
  const source = req.store.buyNow ? [req.store.buyNow] : selectedCart(req)
  return source.map(item => {
    const p = bySku(item.sku), qty = validQty(item.qty)
    if (!p || !qty || !p.stock || qty > p.stock) throw new Error('상품 옵션이나 재고가 변경되었습니다. 장바구니에서 다시 확인해 주세요.')
    return canonicalLine(p,qty)
  })
}
export function checkoutToken(req) {
  req.store.checkout.token ||= randomUUID()
  return req.store.checkout.token
}
export function amountFor(items) {
  const subtotal = items.reduce((sum,item) => sum + item.qty * item.unit_price, 0)
  return {subtotal, shipping:0, tax:0, discount:0, total:subtotal}
}
export const deliveryLabel = {rocket:'로켓배송', fresh:'로켓프레시', seller:'판매자 배송'}
export function itemEta(item) {
  const p = bySku(item.sku)
  return !p.kind ? `${GAME.release_date} 이후 순차 배송` : p.delivery === 'fresh' ? '냉장 포장 · 결제 후 1–2일 이내 도착 예정' : '결제 후 1–3일 이내 도착 예정'
}
export function deliveryGroups(items) {
  const groups = new Map()
  for (const item of items) {
    const p = bySku(item.sku), key = p.delivery === 'seller' ? `seller:${p.seller}` : p.delivery
    if (!groups.has(key)) groups.set(key,{key,delivery:p.delivery,label:deliveryLabel[p.delivery],seller:p.seller,items:[]})
    groups.get(key).items.push(item)
  }
  return [...groups.values()]
}
export const deliveryEta = items => [...new Set(items.map(item => `${deliveryLabel[bySku(item.sku).delivery]}: ${itemEta(item)}`))].join(' / ')
export function deliverySummary(base,items,compact=false) {
  return deliveryGroups(items).map(group => `<section class="delivery-summary ${group.delivery}"><h3>${group.label}${group.delivery==='seller'?` <small>${esc(group.seller)}</small>`:''}</h3>${group.items.map(item => {const p=bySku(item.sku);return `<article class="checkout-item">${compact?'':`<a class="checkout-photo" href="${base}/vp/products/${p.id}?sku=${p.sku}">${media(base,p)}</a>`}<div><strong>${esc(item.title)}</strong><p>${esc(p.label)} · ${item.qty}개</p><p class="item-eta">${itemEta(item)}</p></div><b>${won(item.qty*item.unit_price)}</b></article>`}).join('')}<p class="group-shipping">상품금액 ${won(amountFor(group.items).total)} + 배송비 0원</p></section>`).join('')
}
export function purchaseSummary(req,items) {
  const amount=amountFor(items)
  return `<aside class="summary"><h2>${req.store.buyNow?'바로구매 상품':'선택한 주문상품'} (${items.reduce((sum,item)=>sum+item.qty,0)}개)</h2>${deliverySummary('/coupang',items,true)}<dl><dt>총 상품가격</dt><dd>${won(amount.subtotal)}</dd><dt>배송비</dt><dd>무료</dd><dt>총 결제금액</dt><dd><strong>${won(amount.total)}</strong></dd></dl><p>부가세 포함</p>${req.store.buyNow?'<p>장바구니에 담긴 다른 상품은 그대로 보관됩니다.</p>':''}</aside>`
}
function savedList(req) {
  const saved=retailState(req).savedForLater
  if(!saved.length)return ''
  return `<section class="saved-later"><h2>나중에 구매할 상품 (${saved.length})</h2><p class="hint">옵션과 수량을 보관합니다. 다시 담을 때 현재 판매가와 재고를 확인합니다.</p>${saved.map(item=>{const p=bySku(item.sku);return p?`<article class="saved-later-row"><a class="cart-photo" href="/coupang/vp/products/${p.id}?sku=${p.sku}">${media('/coupang',p)}</a><div><a href="/coupang/vp/products/${p.id}?sku=${p.sku}">${esc(p.title)}</a><p>${esc(p.label)} · ${item.qty}개 · ${won(p.price*item.qty)}</p><form method="post" action="/coupang/cart/saved"><input type="hidden" name="sku" value="${p.sku}"><button name="action" value="restore" class="secondary"${p.stock?'':' disabled'}>장바구니로 이동</button> <button name="action" value="remove" class="link-button">삭제</button></form></div></article>`:''}).join('')}</section>`
}
export function cartBody(req,errors=[],values={}) {
  const items=req.store.cart.map(item=>canonicalLine(bySku(item.sku),item.qty)),selected=selectedCart(req),total=amountFor(selected),selectedSet=new Set(selected.map(i=>i.sku))
  const errorHTML=errors.length?`<div class="errors" role="alert"><strong>입력 내용을 확인해 주세요.</strong><ul>${errors.map(e=>`<li>${esc(e)}</li>`).join('')}</ul></div>`:''
  const selectedForm='<form id="cart-selection" method="post" action="/coupang/cart/selection"></form>'
  const groups=deliveryGroups(items).map(group=>`<section class="cart-group ${group.delivery}"><div class="cart-group-heading"><label data-js-control hidden><input type="checkbox" data-group-toggle="${esc(group.key)}"${group.items.every(i=>selectedSet.has(i.sku))?' checked':''}> ${group.label}</label><strong class="no-js-group">${group.label}</strong>${group.delivery==='seller'?`<span>${esc(group.seller)}</span>`:'<span>무료배송</span>'}</div>${group.items.map(item=>{const p=bySku(item.sku),canonical=products.find(p=>p.id===bySku(item.sku).id);return `<article class="cart-line" data-cart-sku="${p.sku}"><input form="cart-selection" type="checkbox" name="selected" value="${p.sku}" aria-label="${esc(p.title)} 선택" data-line-select data-group="${esc(group.key)}" data-total="${item.qty*item.unit_price}"${selectedSet.has(p.sku)?' checked':''}><a class="cart-photo" href="/coupang/vp/products/${p.id}?sku=${p.sku}">${media('/coupang',p)}</a><div class="cart-description"><a class="cart-title" href="/coupang/vp/products/${p.id}?sku=${p.sku}">${esc(p.title)}</a><p>${esc(p.label)}${!p.kind?' · 스탠다드 에디션 · 박스 내 다운로드 코드 · 예약판매':''}</p><p class="item-eta">${itemEta(item)}</p><p>판매자: ${esc(p.seller)}</p><form class="cart-quantity" method="post" action="/coupang/cart/update"><input type="hidden" name="sku" value="${p.sku}"><label for="qty_${p.sku}">수량 (1–4개)</label><input id="qty_${p.sku}" name="qty_${p.sku}" type="number" min="1" max="4" value="${esc(values[p.sku]??item.qty)}"><button name="action" value="update" class="secondary">수량 변경</button><button name="action" value="save" class="link-button">나중에 구매</button><button name="action" value="remove" class="link-button">삭제</button></form>${canonical.variants?`<details class="cart-option"><summary>옵션 변경</summary><form method="post" action="/coupang/cart/option"><input type="hidden" name="sku" value="${p.sku}"><label for="option_${p.sku}">변경할 옵션</label><select id="option_${p.sku}" name="new_sku">${canonical.variants.map(v=>`<option value="${v.sku}"${v.sku===p.sku?' selected':''}>${esc(v.label)} — ${won(v.price)}</option>`).join('')}</select><button class="secondary">옵션 적용</button></form></details>`:''}</div><strong class="cart-line-price">${won(item.qty*item.unit_price)}<small>${won(item.unit_price)} / 개</small></strong></article>`}).join('')}<div class="cart-group-total">상품가격 <strong>${won(amountFor(group.items).total)}</strong> + 배송비 <strong>0원</strong></div></section>`).join('')
  return `<div class="cart-title-row"><h1>장바구니</h1><p>상품 / 옵션 확인 후 구매해 주세요.</p></div>${errorHTML}${!req.store.user?'<p class="cart-login-notice"><a href="/coupang/login?returnTo=%2Fcoupang%2Fcart">로그인</a>하고 저장한 배송지와 찜한 상품을 확인하세요.</p>':''}${items.length?`${selectedForm}<div class="cart-selection-toolbar"><label data-js-control hidden><input type="checkbox" data-select-all${selected.length===items.length?' checked':''}> 전체선택 <span data-selected-count>${selected.length}</span> / ${items.length}</label><button form="cart-selection" name="action" value="save-selection" class="secondary">선택 저장</button><span>체크한 상품만 주문합니다.</span></div>${groups}<div class="cart-payment-bar"><span>선택 상품 <strong data-selected-total>${won(total.total)}</strong></span><span>배송비 <b>무료</b></span><span>총 주문금액 <strong data-selected-total>${won(total.total)}</strong></span></div><div class="cart-purchase-actions"><a class="button secondary" href="/coupang">계속 쇼핑하기</a><button form="cart-selection" name="action" value="checkout">선택상품 주문하기</button></div>`:'<section class="empty-cart"><div aria-hidden="true">🛒</div><h2>장바구니에 담은 상품이 없습니다.</h2><p>오늘의 상품을 둘러보고 필요한 상품을 담아보세요.</p><a class="button" href="/coupang/np/campaigns/gold-box">오늘의 상품 보러가기</a></section>'}${savedList(req)}`
}
export function installCartControls(router,{cartPage}) {
  const fail=(req,res,message)=>cartPage(req,res,[message])
  router.post('/cart/selection',(req,res)=>{
    const raw=req.body.selected===undefined?[]:Array.isArray(req.body.selected)?req.body.selected:[req.body.selected]
    if(raw.some(sku=>typeof sku!=='string'||!req.store.cart.some(i=>i.sku===sku)))return fail(req,res,'장바구니에 없는 상품이 선택되었습니다.')
    if(!['save-selection','checkout'].includes(req.body.action))return fail(req,res,'선택한 작업을 확인해 주세요.')
    req.store.selectedSkus=[...new Set(raw)]
    delete req.store.buyNow
    invalidateCheckout(req)
    if(req.body.action==='checkout'&&!raw.length)return fail(req,res,'주문할 상품을 1개 이상 선택해 주세요.')
    res.redirect('/coupang/'+(req.body.action==='checkout'?'checkout':'cart'))
  })
  router.post('/cart/option',(req,res)=>{
    const item=req.store.cart.find(i=>i.sku===text(req.body.sku)),next=bySku(text(req.body.new_sku))
    if(!item||!next||bySku(item.sku).id!==next.id)return fail(req,res,'선택한 옵션이 이 상품에 해당하지 않습니다.')
    const existing=req.store.cart.find(i=>i!==item&&i.sku===next.sku),qty=item.qty+(existing?.qty||0)
    if(!next.stock||qty>Math.min(next.stock,4))return fail(req,res,'옵션별 수량은 최대 4개이며 구매 가능한 재고가 있어야 합니다.')
    const wasSelected=selectedCart(req).some(i=>i===item)||selectedCart(req).some(i=>i===existing)
    req.store.cart=req.store.cart.filter(i=>i!==item&&i!==existing)
    req.store.cart.push(canonicalLine(next,qty))
    if(Array.isArray(req.store.selectedSkus)){req.store.selectedSkus=req.store.selectedSkus.filter(s=>s!==item.sku&&s!==next.sku);if(wasSelected)req.store.selectedSkus.push(next.sku)}
    delete req.store.buyNow
    invalidateCheckout(req)
    res.redirect('/coupang/cart')
  })
  router.post('/cart/saved',(req,res)=>{
    const state=retailState(req),item=state.savedForLater.find(i=>i.sku===text(req.body.sku))
    if(!item)return fail(req,res,'보관한 상품을 찾을 수 없습니다.')
    if(req.body.action==='restore'){
      const p=bySku(item.sku),existing=req.store.cart.find(i=>i.sku===item.sku),qty=item.qty+(existing?.qty||0)
      if(!p?.stock||!validQty(item.qty)||qty>Math.min(p.stock,4))return fail(req,res,'장바구니 수량과 재고를 확인해 주세요. 옵션별 최대 수량은 4개입니다.')
      if(existing)Object.assign(existing,canonicalLine(p,qty));else req.store.cart.push(canonicalLine(p,qty))
      if(Array.isArray(req.store.selectedSkus)&&!req.store.selectedSkus.includes(p.sku))req.store.selectedSkus.push(p.sku)
    }else if(req.body.action!=='remove')return fail(req,res,'선택한 작업을 확인해 주세요.')
    state.savedForLater=state.savedForLater.filter(i=>i!==item)
    delete req.store.buyNow
    invalidateCheckout(req)
    res.redirect('/coupang/cart')
  })
  router.post('/checkout/cancel',(req,res)=>{delete req.store.buyNow;invalidateCheckout(req);res.redirect('/coupang/cart')})
}
