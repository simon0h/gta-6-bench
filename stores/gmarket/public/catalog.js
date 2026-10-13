// Display estimates only; the server selects every offer and price independently.
document.querySelectorAll('.purchase-form').forEach(form=>{
 const update=()=>{
  const choice=form.querySelector('[name="variant"]')
  const price=Number(choice?.selectedOptions[0]?.dataset.price||form.dataset.basePrice)
  const quantity=Number(form.querySelector('[name="qty"]').value)
  const won=n=>new Intl.NumberFormat('ko-KR').format(n)+'원'
  document.querySelector('[data-unit-price]').textContent=won(price)
  // Product tabs and gallery are full-page links; carry the current choice with them.
  if(choice)document.querySelectorAll('.product-tabs a,.gallery-thumbnails a,a.review-line').forEach(link=>{
   const url=new URL(link.href);url.searchParams.set('variant',choice.value);link.href=url.pathname+url.search+url.hash
  })
  if(choice){
   const gallery=document.querySelector('[data-product-gallery]')
   const variant=choice.value
   const imageUrl=value=>{const url=new URL(value,location.href);if(variant)url.searchParams.set('variant',variant);else url.searchParams.delete('variant');return url.pathname+url.search}
   gallery?.querySelectorAll('img').forEach(image=>{image.src=imageUrl(image.src)})
   gallery?.querySelectorAll('[data-pa-src]').forEach(button=>{button.dataset.paSrc=imageUrl(button.dataset.paSrc)})
  }
  form.querySelector('[data-item-total]').textContent=Number.isInteger(quantity)&&quantity>=1&&quantity<=5?won(price*quantity):'수량을 확인해 주세요'
 }
 form.addEventListener('input',update)
 form.addEventListener('change',update)
})

// Keep selection totals useful before submission; the server recalculates them.
const cartChecks=[...document.querySelectorAll('input[data-cart-price]')]
const selectAll=document.querySelector('[data-select-all]')
if(selectAll){
 const won=n=>new Intl.NumberFormat('ko-KR').format(n)+'원'
 const updateCart=()=>{
  const selected=cartChecks.filter(input=>input.checked),shipping=new Map()
  const subtotal=selected.reduce((sum,input)=>{shipping.set(input.dataset.cartSeller,Math.max(shipping.get(input.dataset.cartSeller)||0,Number(input.dataset.cartShipping)));return sum+Number(input.dataset.cartPrice)},0)
  const fee=[...shipping.values()].reduce((sum,n)=>sum+n,0)
  document.querySelector('[data-selected-count]').textContent=`선택상품 ${selected.length}개`
  document.querySelector('[data-cart-subtotal]').textContent=won(subtotal)
  document.querySelector('[data-cart-shipping-total]').textContent=won(fee)
  document.querySelector('[data-cart-total]').textContent=won(subtotal+fee)
  selectAll.checked=selected.length===cartChecks.length
  selectAll.indeterminate=selected.length>0&&selected.length<cartChecks.length
 }
 selectAll.addEventListener('change',()=>{cartChecks.forEach(input=>{input.checked=selectAll.checked});updateCart()})
 cartChecks.forEach(input=>input.addEventListener('change',updateCart))
 updateCart()
}
document.querySelectorAll('[data-password-toggle]').forEach(button=>button.addEventListener('click',()=>{
 const input=document.getElementById(button.dataset.passwordToggle),show=input.type==='password'
 input.type=show?'text':'password';button.textContent=show?'숨김':'표시';button.setAttribute('aria-pressed',String(show));button.setAttribute('aria-label',show?'비밀번호 숨김':'비밀번호 표시')
}))
