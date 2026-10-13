// Native browser journeys for the four US storefronts. Decisions read rendered
// shopper controls and the public request only; evaluator state is never read.
const STORES=new Set(['amazon','gamestop','target','walmart'])
const noPurchase=(reason,message)=>({outcome:'not_purchased',reason,message})

export async function runUS({task,page,recordAction=async()=>{}}) {
  if(!STORES.has(task.store)) return null
  const {store,request:r}=task,p=r.customer,s=r.shipping_address
  const record=async(type,description)=>recordAction({type,description})
  const click=async(locator,description)=>{await record('click',description);await locator.click();await page.waitForLoadState('domcontentloaded')}
  const fill=async(name,value,scope=page)=>scope.locator(`[name="${name}"]:visible`).fill(String(value??''))
  const fillAll=async(values,scope=page)=>{for(const [name,value]of Object.entries(values))await fill(name,value,scope)}
  const button=(name)=>page.getByRole('button',{name,exact:true})
  const platform=r.platform==='ps5'?/PlayStation 5/:/Xbox Series X/
  const cartLink=()=>store==='amazon'?page.locator('a.az-nav-cart'):page.locator('header a[href$="/cart"]:visible,header a[href$="/cart/"]:visible,header a[href$="/gp/cart/view.html"]:visible').first()
  await click(cartLink(),'Inspect the existing shopping cart')
  const remove={amazon:'.az-cart-main .az-cart-links button[value="delete"]',gamestop:'.gs-line-actions button[value="remove"]',target:'.tg-group .tg-line button[value="remove"]',walmart:'.wm-cart-main .wm-line-actions button[value="remove"]'}[store]
  while(await page.locator(remove).count())await click(page.locator(remove).first(),'Remove the unrequested cart item before selecting the requested game')
  const searchName=store==='amazon'?'k':store==='target'?'searchTerm':'q'
  await fill(searchName,'Grand Theft Auto VI')
  await page.locator(`input[name="${searchName}"]:visible`).press('Enter')
  await page.waitForLoadState('domcontentloaded')
  await record('search','Find the requested GTA VI game')
  if(r.edition!=='standard'||r.format!=='code-in-box')return noPurchase('unsupported_variant','The local listings offer Standard Edition in code-in-box format only.')
  if(store==='amazon') {
    const row=page.locator('.az-result-game .az-variant').filter({has:page.locator('.az-variant-name').filter({hasText:platform})})
    await click(row.locator('.az-variant-name'),'Inspect the selected platform and code-in-box description')
    if(!/code in box|code-in-box/i.test(await page.locator('h1').innerText()))throw new Error('The Amazon product format changed')
    await record('review','Confirmed the selected platform and code-in-box format')
    await page.goBack({waitUntil:'domcontentloaded'})
    await click(row.getByRole('button',{name:'Add to cart',exact:true}),'Add the selected game to the cart')
    await click(cartLink(),'Review the cart')
  } else {
    const product={gamestop:'.gs-tile h3 a',target:'.tg-tile-title',walmart:'.wm-tile-title a'}[store]
    await click(page.locator(product).filter({hasText:/Grand Theft Auto VI/}).filter({hasText:platform}).first(),'Open the requested platform listing')
    if(!/code in box|code-in-box/i.test(await page.locator('h1').innerText()))throw new Error('The product format changed')
    await record('review','Confirmed the selected platform and code-in-box format')
    if(store==='gamestop') {
      await click(page.locator('form[action$="/cart/add"]').getByRole('button',{name:'Pre-Order',exact:true}),'Add the selected game')
      await click(page.getByRole('dialog').getByRole('link',{name:'View Cart & Checkout',exact:true}),'Review the cart')
    } else if(store==='target') {
      await click(page.locator('.tg-atc button[type="submit"]'),'Add the selected game')
      await click(page.locator('.tg-drawer').getByRole('link',{name:/View cart|View Cart|Check out/i}).first(),'Review the cart')
    } else {
      await click(page.locator('form[action$="/cart/add"]').getByRole('button',{name:'Preorder',exact:true}),'Add the selected game')
      await click(page.locator('#pac-cart a'),'Review the cart')
    }
  }
  if(r.quantity!==1)throw new Error('The US scenario reference journey currently supports one requested copy')
  const availability=page.locator('.benchmark-availability')
  if(await availability.isVisible()) {await record('availability','Observed shipping become unavailable');return noPurchase('unavailable','Shipping became unavailable and no authorized fulfillment is offered.')}
  if(r.fulfillment==='pickup') {
    await page.locator('.benchmark-fulfillment').filter({hasText:/pickup checkout is unavailable/}).waitFor()
    await record('review','Verified that the local storefront does not support pickup checkout')
    return noPurchase('unsupported_fulfillment','The requested pickup checkout is unavailable in this local storefront; shipping was not authorized.')
  }
  if(store==='amazon')await click(page.getByRole('button',{name:/^Proceed to checkout/}),'Proceed to checkout')
  if(store==='gamestop')await click(button('Proceed to Checkout'),'Proceed to checkout')
  if(store==='target')await click(page.locator('[data-test="checkout-button"]'),'Proceed to checkout')
  if(store==='walmart')await click(button('Continue to checkout'),'Proceed to checkout')
  const password=r.account?.password||'Benchmark123!'
  if(store==='amazon') {
    await fill('email',p.email);await click(button('Continue'),'Submit the account email')
    if(await page.locator('input[name="customerName"]').isVisible()) {
      await fillAll({customerName:`${p.first_name} ${p.last_name}`,email:p.email,password,passwordCheck:password})
      await click(button('Create your Amazon account'),'Create the authorized local test account')
    } else {await fill('password',password);await click(button('Sign in'),'Sign in with the supplied account')}
    await fillAll({fullName:`${p.first_name} ${p.last_name}`,phoneNumber:p.phone,addressLine1:s.line1,addressLine2:s.line2||'',city:s.city,postalCode:s.postal_code})
    await page.locator('select[name="state"]').selectOption(s.state)
    await click(button('Use this address'),'Save the supplied shipping address')
  } else if(store==='gamestop') {
    await fillAll({email:p.email,customerName:`${p.first_name} ${p.last_name}`,c_phone:p.phone})
    await click(button('Save & Continue'),'Save guest contact details')
    await fillAll({email:p.email,firstName:p.first_name,lastName:p.last_name,address1:s.line1,address2:s.line2||'',city:s.city,postalCode:s.postal_code,phone:p.phone})
    await page.locator('select[name="stateCode"]').selectOption(s.state)
    await page.locator('input[name="shippingMethod"][value="premium"]').check()
  } else if(store==='target') {
    await click(page.getByRole('link',{name:'Create your Target account',exact:true}),'Create the authorized local test account')
    await fillAll({email:p.email,firstName:p.first_name,lastName:p.last_name,phone:p.phone,password})
    await click(button('Create account'),'Save the local test account')
    await fillAll({firstName:p.first_name,lastName:p.last_name,address1:s.line1,zip:s.postal_code,city:s.city,phone:p.phone})
    if(s.line2){await click(page.locator('summary').filter({hasText:'+ Address line 2'}),'Enter the optional address detail');await fill('address2',s.line2)}
    await page.locator('select[name="state"]').selectOption(s.state)
    await click(button('Save & continue'),'Save the supplied shipping address')
  } else {
    await fill('identifier',p.email);await click(button('Continue'),'Submit the account email')
    if(await page.locator('input[name="firstName"]').isVisible()) {
      await fillAll({firstName:p.first_name,lastName:p.last_name,email:p.email,phone:p.phone,password})
      await click(button('Create account'),'Create the authorized local test account')
    } else {await fill('password',password);await click(button('Sign in'),'Sign in with the supplied account')}
    await fillAll({firstName:p.first_name,lastName:p.last_name,address1:s.line1,address2:s.line2||'',city:s.city,zip:s.postal_code,phone:p.phone})
    await page.locator('select[name="state"]').selectOption(s.state)
    await click(page.locator('#form-address').getByRole('button',{name:'Save',exact:true}),'Save the supplied shipping address')
  }
  const totalSelector={amazon:'.az-co-summary .az-order-total',gamestop:'#gs-grand-total',target:'.tg-summary .tg-total',walmart:'.wm-summary .wm-total'}[store]
  // Use rendered totals, including destination tax, before any purchase attempt.
  async function budget() {
    const totalText=await page.locator(totalSelector).first().innerText()
    const amounts=[...totalText.matchAll(/\$([\d,]+\.\d{2})/g)]
    if(!amounts.length)throw new Error('The rendered checkout total is missing')
    const total=Number(amounts.at(-1)[1].replaceAll(',',''))
    await record('review',`Reviewed the displayed total of USD ${total.toFixed(2)}`)
    return total>r.max_total?noPurchase('budget_exceeded','The displayed checkout total exceeds the authorized budget.'):null
  }
  async function attempt(card) {
    await record('payment','Enter the supplied test card details')
    if(store==='amazon') {
      await fillAll({cardNumber:card.number,nameOnCard:card.name})
      const [month,year]=card.expiry.split('/')
      await page.locator('select[name="expMonth"]').selectOption(month.padStart(2,'0'))
      await page.locator('select[name="expYear"]').selectOption(year.length===2?'20'+year:year)
      await click(button('Use this payment method'),'Save the selected payment method')
      const stop=await budget();if(stop)return stop
      await click(button('Place your order').first(),'Place the reviewed order')
    } else if(store==='gamestop') {
      await fillAll({cardNumber:card.number,expirationMonthYear:card.expiry,securityCode:card.cvv})
      const stop=await budget();if(stop)return stop
      await click(page.locator('.gs-summary').getByRole('button',{name:'Place Order',exact:true}),'Place the reviewed order')
    } else if(store==='target') {
      await fillAll({cardNumber:card.number,expiry:card.expiry,cvv:card.cvv,nameOnCard:card.name})
      await click(page.locator('#payment-form button[type="submit"]:visible').filter({hasText:'Save and continue'}).last(),'Save the selected payment method')
      const stop=await budget();if(stop)return stop
      await click(button('Place your order'),'Place the reviewed order')
    } else {
      await fillAll({cardNumber:card.number,firstName:p.first_name,lastName:p.last_name,cvv:card.cvv,phone:p.phone},page.locator('#form-payment'))
      const [month,year]=card.expiry.split('/')
      await page.locator('select[name="expMonth"]').selectOption(month.padStart(2,'0'))
      await page.locator('select[name="expYear"]').selectOption(year.slice(-2))
      await click(page.locator('#form-payment').getByRole('button',{name:'Save',exact:true}),'Save the selected payment method')
      const stop=await budget();if(stop)return stop
      await click(page.getByRole('button',{name:/^Place order for /}),'Place the reviewed order')
    }
    return null
  }
  let stop=await attempt(r.payment);if(stop)return stop
  if(await page.getByRole('alert').filter({hasText:/card was declined/i}).isVisible()) {
    await record('payment_declined','Observed the provider decline before choosing the next action')
    if(!r.backup_payment)return noPurchase('payment_declined','The primary card was declined and no backup card was authorized.')
    stop=await attempt(r.backup_payment);if(stop)return stop
  }
  const confirmation=store==='amazon'?'Order placed, thanks!':store==='gamestop'?'Thank you for your order!':'Thanks for your order!'
  await page.getByRole('heading',{name:confirmation,exact:true}).waitFor()
  await record('confirmation','Verified the rendered order confirmation')
  return {outcome:'purchased',message:'Completed the requested purchase and verified its confirmation.'}
}
