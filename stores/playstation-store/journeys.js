import { shippingReceipt } from './physical.js'
import { randomBytes } from 'node:crypto'
import { esc, money } from '../../lib/html.js'
import { PRODUCTS, byId, productPath } from './data.js'
import { art } from './catalog-pages.js'
import { signInUrl, onlineId } from './pages.js'
import { SUPPORT_CATEGORIES } from './pdc.js'

const scalar = v => typeof v === 'string' ? v.trim() : ''
const date = v => new Date(v).toLocaleDateString('en-US', {year:'numeric',month:'short',day:'numeric'})
const isoDay = v => new Date(v).toISOString().slice(0,10)
const id = () => randomBytes(9).toString('hex')
const button = (text, cls='blue') => `<button class="ps-pill ps-pill-${cls}" type="submit">${text}</button>`
const link = (base,path,text) => `<a class="ps-link" href="${base}/en-us/${path}">${text}</a>`
const errorBox = errors => errors.length ? `<div class="ps-error ps-error-box" role="alert">${errors.map(esc).join('<br>')}</div>` : ''
const input = (name,label,value='',type='text',extra='') => `<div class="ps-field"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${esc(value)}" ${extra}></div>`
const select = (name,label,choices,value='') => `<div class="ps-field"><label for="${name}">${label}</label><select id="${name}" name="${name}">${choices.map(([k,v])=>`<option value="${esc(k)}" ${k===value?'selected':''}>${esc(v)}</option>`).join('')}</select></div>`
const textArea = (name,label,value='') => `<div class="ps-field"><label for="${name}">${label}</label><textarea id="${name}" name="${name}" rows="5" maxlength="2000">${esc(value)}</textarea></div>`
const accountLinks = [['account','Account overview'],['account/profile','Profile and preferences'],['wishlist','Wishlist'],['library','Game Library'],['transactions','Transaction History'],['membership','Subscriptions'],['payment-management','Payment Management'],['support/cases','Support cases']]
export function accountState(req) {
  if (!req.store.user) return null
  req.store.customerAccounts ??= {}
  return req.store.customerAccounts[req.store.user.id] ??= {wishlist:[],profile:null,preferences:{console:'PS5',activity:'friends',offers:'no'},cases:[],membership:null}
}
export function resumeWishlist(req, back) {
  const pending=req.store.pendingWishlist
  delete req.store.pendingWishlist
  if (!pending || pending.back!==back || Date.now()-pending.at>30*60*1000 || !byId(pending.sku)) return
  const state=accountState(req)
  if(!state.wishlist.includes(pending.sku))state.wishlist.push(pending.sku)
  req.store.flash=`${byId(pending.sku).title} was added to your wishlist.`
}
export function restoreProfile(req) {
  const profile=accountState(req)?.profile
  if(profile)Object.assign(req.store.user,profile)
}
function shell(base,title,body,active='account') {
  return `<section class="ps-journey"><div class="ps-journey-heading"><p>YOUR PLAYSTATION</p><h1>${esc(title)}</h1></div><div class="ps-journey-layout"><nav class="ps-journey-nav" aria-label="Account">${accountLinks.map(([p,l])=>`<a href="${base}/en-us/${p}" ${active===p?'aria-current="page"':''}>${l}</a>`).join('')}<a href="${base}/logout">Sign Out</a></nav><div class="ps-journey-content">${body}</div></div></section>`
}
function licenses(orders) {
  const entries=new Map()
  for(const order of orders)for(const snap of order.meta.entitlements||[]) {
    const item=order.items.find(i=>i.sku===snap.sku)
    if(!item)continue
    const entry={...snap,title:item.title,order,source:'Purchased'}
    entries.set(snap.sku,entry)
    for(const sku of snap.includedSkus||[]) {
      const p=byId(sku)
      if(p&&!entries.has(sku))entries.set(sku,{sku,title:p.title,contentType:p.contentType,platforms:snap.platforms,release:snap.release,preorder:snap.preorder,baseId:p.baseId,licenses:p.entitlements,order,source:'Included in edition'})
    }
  }
  return [...entries.values()]
}
const membershipActive = m => Boolean(m&&new Date(m.endsAt)>new Date())
const catalogAllowed = (m,p) => membershipActive(m)&&['Extra','Premium'].includes(m.tier)&&p?.plusTag==='Extra'&&p.fictional&&!p.includedSkus?.length
function libraryEntries(req,orders) {
  const entries=licenses(orders),m=accountState(req).membership
  for(const sku of m?.claims||[])if(!entries.some(e=>e.sku===sku)) {
    const p=byId(sku)
    if(p)entries.push({sku,title:p.title,platforms:p.platforms,contentType:p.contentType,release:p.release,licenses:[`${p.platforms.join(' / ')} catalog access`],source:'PlayStation Plus',subscription:true,active:catalogAllowed(m,p)})
  }
  return entries
}
function releaseLocked(e) { return Boolean(e.preorder&&new Date(e.release).getTime()>Date.now()) }
function licenseStatus(e) {
  return e.subscription ? e.active?'Subscription access':'Subscription access ended' : releaseLocked(e)?`Pre-ordered · Releases ${e.release}` : e.contentType==='consumable'?'In-game content purchased':e.contentType==='add-on'?'Add-on purchased':'Purchased'
}
const caseFor = (state,order,sku) => state.cases.find(c=>c.orderId===order.id&&c.sku===sku&&c.kind==='refund')
const ARTICLES=[
 ['downloads','Download purchased games','Downloads and licenses','Open Game Library on your console and choose Purchased or Your Collection. Select a released game, then Download. Remote downloads require an appropriately configured linked console.'],
 ['licenses','Find a missing game or license','Downloads and licenses','Check that you are using the account that purchased the game. Open Transaction History to confirm the purchase, then check its platform and edition in Game Library. A PS4-only license does not add a PS5 edition. Restore licenses from your console settings if needed.'],
 ['addons','Add-ons and in-game currency','Games and add-ons','Add-ons require a compatible base game and region. Check the edition contents before buying separately. Some content installs with a game; currency is delivered within the compatible game when launched. Ownership of a disc copy of the base game is not checked at purchase.'],
 ['refunds','Request a purchase refund','Purchases and refunds','Open Transaction History, select a purchase and choose Request Refund. Games and DLC generally require a request within 14 days and no download or streaming. Consumables require that the game has not been launched after purchase. Faulty content needs support review. A submitted request is not approval or money returned.'],
 ['preorders','Manage a pre-order','Purchases and refunds','A pre-order is recorded when payment is confirmed. It remains release-locked until its release date. Refund checks depend on when you purchased, the release date and whether the main content has been downloaded or preloaded. Request cancellation from the transaction; submitting does not cancel the license automatically.'],
 ['subscriptions','Cancel or reactivate PlayStation Plus','Subscriptions','Cancellation stops a future renewal. Benefits continue until the current period ends. Subscription catalog access depends on an active eligible plan and availability; purchased games remain separate. Manage your membership from Subscriptions.'],
 ['payments','Manage payment methods and charges','Account and payments','Review the total, currency and tax in Transaction History. Wallet funds apply first at checkout. Payment Management can remove a saved masked payment method. Adding a method happens in checkout. No bank or PayPal connection is made in this environment.'],
 ['account','Profile, privacy and signing in','Account and payments','Sign in with your email address and password through the two-step Sony account screens. Profile and preferences controls your display name and activity preference. Sign Out clears the active cart and checkout. To recover a password, change your online ID or manage family members, go to Settings > Users and Accounts on your PS5 or PS4 console.'],
]
const CATEGORIES=['Downloads and licenses','Games and add-ons','Purchases and refunds','Subscriptions','Account and payments']
function caseForm(base,orders,values={},errors=[]) {
 return `${errorBox(errors)}<p>Describe the issue without passwords or full payment details. Your case appears in Support cases, where you can follow its status and add information.</p><form method="post" action="${base}/en-us/support/contact" class="ps-journey-form" novalidate>${select('category','Topic',[['','Choose a topic'],...CATEGORIES.map(c=>[c,c])],values.category)}${input('subject','Subject',values.subject,'text','maxlength="100" required')}${select('order_id','Related transaction (optional)',[['','No transaction'],...orders.map(o=>[o.id,`${date(o.created_at)} · ${o.order_number}`])],values.order_id)}${textArea('message','How can we help?',values.message)}${button('Submit support case')}</form>`
}
function refundForm(base,order,values={},errors=[]) {
 const options=order.items.filter(i=>!byId(i.sku)?.physical).map(i=>[i.sku,i.title])
 return `${errorBox(errors)}<p>Request a review of a purchased item or a pre-order cancellation. Answer for the selected item, including any preload.</p><form class="ps-journey-form" method="post" action="${base}/en-us/transactions/${order.id}/request" novalidate>${select('sku','Purchase item',[['','Select an item'],...options],values.sku)}${select('downloaded','Have you downloaded, preloaded or streamed the content?',[['','Choose an answer'],['no','No'],['yes','Yes']],values.downloaded)}${select('launched','For in-game currency, have you launched the game since purchase?',[['','Choose an answer'],['no','No'],['yes','Yes'],['not-applicable','Not in-game currency']],values.launched)}${select('faulty','Is the content faulty?',[['','Choose an answer'],['no','No'],['yes','Yes']],values.faulty)}${textArea('reason','Reason for your request',values.reason)}<label class="ps-check"><input type="checkbox" name="ack" value="yes" ${values.ack==='yes'?'checked':''}> I understand that submitting this request does not guarantee a refund.</label>${button('Submit refund / cancellation request')}</form>`
}
export function installJourneys(router,{render,myOrders,wallet,returnPath}) {
 const renderPage=(req,res,title,body,active='account',status=200)=>render(req,res,{title,body:shell(res.locals.base,title,body,active),status})
 const gate=(req,res,next)=>req.store.user?next():res.redirect(signInUrl(res.locals.base,req.originalUrl))
 const missing=(req,res)=>renderPage(req,res,'Content unavailable','<p>This item is not available in your account.</p>','account',404)
 const owned=(req,key)=>myOrders(req).find(o=>o.id===key||o.order_number===key)
 // Headers prohibit browser caching of account data and transaction details.
 router.use(['/en-us/account','/en-us/wishlist','/en-us/library','/en-us/transactions','/en-us/membership','/en-us/payment-management','/en-us/support/cases','/en-us/support/contact'],(req,res,next)=>{res.set('Cache-Control','no-store');next()})
 router.get('/en-us/account',gate,(req,res)=>{
   const b=res.locals.base,s=accountState(req),orders=myOrders(req),m=s.membership
   renderPage(req,res,'Account overview',`<div class="ps-account-welcome"><span class="ps-profile-emblem" aria-hidden="true">PS</span><div><h2>${esc(onlineId(req.store.user))}</h2><p>${esc(req.store.user.email)}</p><p>United States · ${esc(s.preferences.console)}</p></div></div><div class="ps-journey-cards">${[['library','Game Library',`${licenses(orders).length} purchased content items`],['wishlist','Wishlist',`${s.wishlist.length} saved games and add-ons`],['transactions','Transaction History',`${orders.length} completed purchases`],['membership','PlayStation Plus',m?`${m.tier} · ${membershipActive(m)?'Active':'Membership ended'}`:'No membership'],['support/cases','Support cases',`${s.cases.length} request${s.cases.length===1?'':'s'}`],['account/profile','Your preferences','Profile, privacy and communication choices']].map(([path,title,detail])=>`<a class="ps-journey-card" href="${b}/en-us/${path}"><h3>${title}</h3><p>${esc(detail)}</p><span aria-hidden="true">›</span></a>`).join('')}</div>`)
 })
 const profile=(req,res,values,errors=[],status=200)=>{
  const s=accountState(req),v=values||{first_name:req.store.user.first_name,last_name:req.store.user.last_name,...s.preferences}
  renderPage(req,res,'Profile and preferences',`${scalar(req.query.saved)==='1'?'<p role="status" class="ps-notice">Your preferences have been saved.</p>':''}${errorBox(errors)}<p>Online ID: <b>${esc(onlineId(req.store.user))}</b> · Sign-in ID: ${esc(req.store.user.email)}</p><form method="post" action="${res.locals.base}/en-us/account/profile" class="ps-journey-form" novalidate><h2>Display name</h2>${input('first_name','First name',v.first_name,'text','maxlength="60" required')}${input('last_name','Last name',v.last_name,'text','maxlength="60" required')}<h2>Preferences</h2>${select('console','Preferred console',[['PS5','PS5'],['PS4','PS4']],v.console)}${select('activity','Who can see your activity?',[['friends','Friends'],['private','Only me']],v.activity)}${select('offers','News and offers',[['no','Do not send offers'],['yes','Receive offers']],v.offers)}<p class="ps-fine">These preferences apply to your account for PlayStation.</p>${button('Save preferences')}</form>`,'account/profile',status)
 }
 router.get('/en-us/account/profile',gate,(req,res)=>profile(req,res))
 router.post('/en-us/account/profile',gate,(req,res)=>{
  const v=Object.fromEntries(['first_name','last_name','console','activity','offers'].map(k=>[k,scalar(req.body[k])])),errors=[]
  for(const k of ['first_name','last_name'])if(!v[k]||v[k].length>60)errors.push(`Enter a ${k.replace('_',' ')} of 1–60 characters.`)
  if(!['PS5','PS4'].includes(v.console)||!['friends','private'].includes(v.activity)||!['yes','no'].includes(v.offers))errors.push('Choose a valid preference for each field.')
  if(errors.length)return profile(req,res,v,errors,400)
  const s=accountState(req);s.profile={first_name:v.first_name,last_name:v.last_name};s.preferences={console:v.console,activity:v.activity,offers:v.offers};restoreProfile(req)
  res.redirect(`${res.locals.base}/en-us/account/profile?saved=1`)
 })
 router.get('/en-us/wishlist',gate,(req,res)=>{
  const b=res.locals.base,s=accountState(req),q=scalar(req.query.q).slice(0,100),items=s.wishlist.map(byId).filter(p=>p&&p.title.toLowerCase().includes(q.toLowerCase()))
  renderPage(req,res,'Wishlist',`<form class="ps-journey-filter" method="get">${input('q','Search wishlist',q,'search')}${button('Search')}</form><p>${items.length} saved item${items.length===1?'':'s'}</p><div class="ps-journey-products">${items.map(p=>`<article class="ps-journey-product"><a href="${productPath(b,p)}">${art(p)}<h2>${esc(p.title)}</h2></a><p>${esc(p.platforms.join(' / '))} · ${p.price===null?'Unavailable':money(p.price)}</p><form method="post" action="${b}/en-us/wishlist"><input type="hidden" name="sku" value="${esc(p.id)}"><input type="hidden" name="action" value="remove"><input type="hidden" name="returnTo" value="${b}/en-us/wishlist">${button('Remove from wishlist','outline')}</form></article>`).join('')}</div>${!items.length?`<p>${q?'No saved items match your search.':'Save a game from its product page to find it here.'}</p>${link(b,'pages/browse','Browse games')}`:''}`,'wishlist')
 })
 router.post('/en-us/wishlist',(req,res)=>{
  const p=byId(scalar(req.body.sku)),action=req.body.action===undefined?'add':scalar(req.body.action),b=res.locals.base
  if(!p||!['add','remove'].includes(action))return renderPage(req,res,'Wishlist','<p>Choose a valid game and wishlist action.</p>','wishlist',400)
  const back=returnPath(res,req.body.returnTo||productPath(b,p))
  if(!req.store.user){if(action==='add')req.store.pendingWishlist={sku:p.id,back,at:Date.now()};return res.redirect(signInUrl(b,back))}
  const s=accountState(req)
  if(action==='remove')s.wishlist=s.wishlist.filter(k=>k!==p.id)
  else if(!s.wishlist.includes(p.id))s.wishlist.push(p.id)
  req.store.flash=`${p.title} was ${action==='remove'?'removed from':'added to'} your wishlist.`
  res.redirect(back)
 })
 router.get('/en-us/library',gate,(req,res)=>{
  const b=res.locals.base,q=scalar(req.query.q).slice(0,100),platform=scalar(req.query.platform),kind=scalar(req.query.kind)
  const all=libraryEntries(req,myOrders(req)),entries=all.filter(e=>e.title.toLowerCase().includes(q.toLowerCase())&&(!['PS4','PS5'].includes(platform)||e.platforms.includes(platform))&&(!['base-game','add-on','consumable','preorder','subscription'].includes(kind)||(kind==='preorder'?releaseLocked(e):kind==='subscription'?e.subscription:e.contentType===kind)))
  renderPage(req,res,'Game Library',`<form class="ps-journey-filter" method="get">${input('q','Search library',q,'search')}${select('platform','Platform',[['','All platforms'],['PS5','PS5'],['PS4','PS4']],platform)}${select('kind','Content',[['','All content'],['base-game','Games'],['add-on','Add-ons'],['consumable','In-game content'],['preorder','Pre-orders'],['subscription','PlayStation Plus']],kind)}${button('Apply')}</form><p>${entries.length} item${entries.length===1?'':'s'} · Purchase licenses and subscription access</p><div class="ps-journey-products">${entries.map(e=>`<article class="ps-journey-product">${byId(e.sku)?art(byId(e.sku)):''}<h2>${esc(e.title)}</h2><p>${esc(e.platforms.join(' / '))}</p><p class="ps-entitlement-status">${esc(licenseStatus(e))}</p><p>${e.order?`Order Number ${esc(e.order.order_number)}`:'Requires an active eligible subscription'}</p>${link(b,`library/${encodeURIComponent(e.sku)}`,'View entitlement')}</article>`).join('')}</div>${!entries.length?`<p>${all.length?'No content matches these filters.':'You have not purchased anything yet.'}</p>${link(b,'pages/browse','Browse games')}`:''}`,'library')
 })
 router.get('/en-us/library/:sku',gate,(req,res)=>{
  const b=res.locals.base,all=libraryEntries(req,myOrders(req)),e=all.find(v=>v.sku===req.params.sku)
  if(!e)return missing(req,res)
  const base=e.baseId?byId(e.baseId):null,baseOwned=base&&all.some(v=>v.sku===base.id&&(!v.subscription||v.active)),pending=e.order&&caseFor(accountState(req),e.order,e.sku)
  renderPage(req,res,e.title,`<div class="ps-entitlement">${byId(e.sku)?art(byId(e.sku)):''}<div><p class="ps-entitlement-status">${esc(licenseStatus(e))}</p><h2>${esc(e.source)}</h2><p>${esc(e.platforms.join(' / '))}</p><ul>${(e.licenses||[]).map(l=>`<li>${esc(l)}</li>`).join('')}</ul>${e.order?`<p>Order Number ${esc(e.order.order_number)} · ${date(e.order.created_at)}</p>${link(b,`transactions/${e.order.id}`,'View transaction')}`:''}</div></div>${pending?`<p class="ps-notice">${esc(pending.subject)} · ${esc(pending.status)}. Your entitlement has not been revoked.</p>`:''}<div class="ps-journey-panel"><h2>${releaseLocked(e)?'Available at release':e.contentType==='consumable'?'Use within the game':e.subscription?(e.active?'Catalog access':'Access needs an eligible membership'):'Console download guidance'}</h2><p>${releaseLocked(e)?`This pre-order remains locked until ${esc(e.release)}. No download or preload has started here.`:e.contentType==='consumable'?'Launch the compatible game using this account to access purchased currency. This is a service entitlement, not a downloadable game file.':e.subscription?(e.active?'Catalog access lasts while your membership has an eligible plan and this game remains included. No game files are downloaded or console benefits activated here.':'This catalog claim remains listed, but its subscription access has ended. It is not a permanent purchased license.'):'On your compatible console, sign in to the purchasing account, open Game Library and select the content. This page confirms the license; it does not start or claim to complete a download.'}</p>${base?`<p><b>Compatible base game required:</b> <a href="${productPath(b,base)}">${esc(base.title)}</a>. ${baseOwned?'A compatible digital base license is present.':'No compatible digital base license was found in this account. A compatible physical copy may also work; its ownership cannot be checked here.'}</p>`:''}${link(b,'support/downloads','Get download help')}</div>`,'library')
 })
 router.get('/en-us/transactions',gate,(req,res)=>{
  const b=res.locals.base,now=new Date(),past=new Date(now);past.setFullYear(past.getFullYear()-2)
  const v={from:req.query.from===undefined?isoDay(past):scalar(req.query.from),to:req.query.to===undefined?isoDay(now):scalar(req.query.to)},valid=d=>/^\d{4}-\d{2}-\d{2}$/.test(d)&&!Number.isNaN(Date.parse(d))&&isoDay(d)===d
  const errors=!valid(v.from)||!valid(v.to)||v.from>v.to?['Choose valid dates with the start on or before the end.']:[]
  const orders=errors.length?[]:myOrders(req).filter(o=>o.created_at.slice(0,10)>=v.from&&o.created_at.slice(0,10)<=v.to).reverse()
  renderPage(req,res,'Transaction History',`${errorBox(errors)}<form class="ps-journey-filter" method="get">${input('from','From',v.from,'date')}${input('to','To',v.to,'date')}${button('Apply date range')}</form><p>Showing purchases from this account and browser session. The default range is the past two years.</p><div class="ps-transaction-list">${orders.map(o=>`<a href="${b}/en-us/transactions/${o.id}"><div><b>${esc(o.items.map(i=>i.title).join(', '))}</b><p>${date(o.created_at)} · Order Number ${esc(o.order_number)}</p></div><strong>${money(o.totals.total)}</strong></a>`).join('')}</div>${!orders.length?'<p>No transactions in this date range.</p>':''}`,'transactions',errors.length?400:200)
 })
 router.get('/en-us/transactions/:id',gate,(req,res)=>{
  const o=owned(req,req.params.id);if(!o)return missing(req,res)
  const b=res.locals.base,cases=accountState(req).cases.filter(c=>c.orderId===o.id)
  renderPage(req,res,'Transaction details',`<p>Order Number <b>${esc(o.order_number)}</b> · ${date(o.created_at)}</p><p>Purchased by ${esc(o.customer.email)}</p><ul class="ps-transaction-items">${o.items.map(i=>`<li><div><b>${esc(i.title)}</b><p>${byId(i.sku)?.physical?'Physical item · standard shipping':link(b,`library/${encodeURIComponent(i.sku)}`,'View content entitlement')}</p></div><span>${money(i.unit_price)}</span></li>`).join('')}</ul><dl class="ps-info-table"><div><dt>Subtotal</dt><dd>${money(o.totals.subtotal)}</dd></div><div><dt>Tax</dt><dd>${money(o.totals.tax)}</dd></div><div><dt>Total (USD)</dt><dd>${money(o.totals.total)}</dd></div><div><dt>Payment</dt><dd>${esc(o.payment.method==='card'?`${o.payment.brand} ending in ${o.payment.last4}`:o.payment.method==='paypal'?'PayPal':'Wallet / no payment required')}</dd></div><div><dt>Fulfillment</dt><dd>${o.shipping_address?'Physical delivery':'Digital license'}</dd></div></dl>${shippingReceipt(o)}<p>${o.meta.entitlements?.length?`<a class="ps-pill ps-pill-blue" href="${b}/en-us/transactions/${o.id}/request">Request Refund / Pre-order cancellation</a>`:''} ${o.shipping_address?link(b,'support/contact','Contact support about physical delivery'):''}</p>${cases.length?`<h2>Requests</h2>${cases.map(c=>`<p>${link(b,`support/cases/${c.id}`,`${esc(c.subject)} · ${esc(c.status)}`)}</p>`).join('')}`:''}<p>Requests do not change the recorded purchase or issue money to a payment method. ${link(b,'support/refunds','Read refund guidance')}</p>`,'transactions')
 })
 router.get('/en-us/transactions/:id/request',gate,(req,res)=>{
  const o=owned(req,req.params.id);if(!o)return missing(req,res)
  if(!o.meta.entitlements?.length)return res.redirect(`${res.locals.base}/en-us/support/contact`)
  renderPage(req,res,'Request Refund',refundForm(res.locals.base,o,{sku:scalar(req.query.sku)}),'transactions')
 })
 router.post('/en-us/transactions/:id/request',gate,(req,res)=>{
  const o=owned(req,req.params.id);if(!o)return missing(req,res)
  const v=Object.fromEntries(['sku','downloaded','launched','faulty','reason','ack'].map(k=>[k,scalar(req.body[k])])),e=o.meta.entitlements?.find(e=>e.sku===v.sku),errors=[]
  if(!e||!o.items.some(i=>i.sku===v.sku))errors.push('Choose an item in this transaction.')
  if(!['yes','no'].includes(v.downloaded)||!['yes','no'].includes(v.faulty)||!['yes','no','not-applicable'].includes(v.launched))errors.push('Answer each eligibility question.')
  if(e?.contentType==='consumable'&&v.launched==='not-applicable')errors.push('Tell us whether you launched the game after buying its currency.')
  if(v.reason.length<10||v.reason.length>2000)errors.push('Give a reason of 10–2000 characters.')
  if(v.ack!=='yes')errors.push('Confirm that you understand submitting a request does not guarantee a refund.')
  if(errors.length)return renderPage(req,res,'Request Refund',refundForm(res.locals.base,o,v,errors),'transactions',400)
  const s=accountState(req),existing=caseFor(s,o,v.sku)
  if(existing)return res.redirect(`${res.locals.base}/en-us/support/cases/${existing.id}`)
  const elapsed=(Date.now()-Date.parse(o.created_at))/86400000,release=Date.parse(e.release),preorderBeforeRelease=e.preorder&&Date.now()<release,earlyPreorder=e.preorder&&(release-Date.parse(o.created_at))/86400000>14
  const timeEligible=preorderBeforeRelease&&earlyPreorder||elapsed<=14
  const eligible=timeEligible&&v.downloaded==='no'&&(e.contentType!=='consumable'||v.launched==='no')
  const c={id:id(),kind:'refund',orderId:o.id,sku:e.sku,category:'Purchases and refunds',subject:preorderBeforeRelease?'Pre-order cancellation request':'Refund request',status:eligible?'Pending eligibility review':'Needs support review',message:v.reason,answers:{downloaded:v.downloaded,launched:v.launched,faulty:v.faulty},createdAt:new Date().toISOString(),updates:[]}
  s.cases.push(c);res.redirect(`${res.locals.base}/en-us/support/cases/${c.id}`)
 })
 router.get('/en-us/support',(req,res)=>{
  const b=res.locals.base,q=scalar(req.query.q).slice(0,150),topic=scalar(req.query.topic),items=ARTICLES.filter(a=>a.join(' ').toLowerCase().includes(q.toLowerCase()))
  render(req,res,{title:'PlayStation Support',chrome:'pdc',body:`<section class="ps-support-hero"><h1>PlayStation Support</h1><p>How can we help?</p><form class="ps-journey-filter" method="get">${input('q','Search help articles',q,'search')}${button('Search help')}</form></section><section class="ps-section"><h3 class="ps-support-subhead">Browse help by category</h3><div class="ps-support-cats">${SUPPORT_CATEGORIES.map(([slug,label,desc])=>`<a href="${b}/en-us/support/${slug}"><b>${esc(label)}</b><small>${esc(desc)}</small></a>`).join('')}</div></section><section class="ps-section">${topic?`<p>Looking for ${esc(topic)}? Explore the guides below or contact support.</p>`:''}<h2>${q?`${items.length} help results`:'Popular help topics'}</h2><div class="ps-journey-cards">${items.map(([slug,title,category,body])=>`<a class="ps-journey-card" href="${b}/en-us/support/${slug}"><p>${esc(category)}</p><h3>${esc(title)}</h3><p>${esc(body.length>120?body.slice(0,body.lastIndexOf(' ',116)).replace(/[,.;:]$/,'')+'…':body)}</p></a>`).join('')}</div>${!items.length?'<p>No articles found. Try “download”, “refund”, “currency” or “subscription”.</p>':''}<div class="ps-support-actions">${link(b,'support/contact','Contact support')}${link(b,'support/cases','My support cases')}${link(b,'account','Account overview')}</div></section><section class="ps-section ps-support-split"><div><h3>Secure sign in with passkey</h3><p>Replace your password with a passkey synced across your devices.</p>${link(b,'support/account','Set up a passkey')}</div><div><h3>Important notices</h3><p>PlayStation products, features and services that are discontinued or no longer available.</p>${link(b,'support/store','PS Store & Refunds')}</div></section>`})
 })
 router.get('/en-us/support/contact',gate,(req,res)=>renderPage(req,res,'Contact support',caseForm(res.locals.base,myOrders(req)),'support/cases'))
 router.post('/en-us/support/contact',gate,(req,res)=>{
  const v=Object.fromEntries(['category','subject','message','order_id'].map(k=>[k,scalar(req.body[k])])),errors=[]
  if(!CATEGORIES.includes(v.category))errors.push('Choose a support topic.')
  if(v.subject.length<4||v.subject.length>100)errors.push('Enter a subject of 4–100 characters.')
  if(v.message.length<10||v.message.length>2000)errors.push('Enter a message of 10–2000 characters.')
  const o=v.order_id?owned(req,v.order_id):null
  if(v.order_id&&!o)errors.push('Choose a transaction from your account.')
  if(errors.length)return renderPage(req,res,'Contact support',caseForm(res.locals.base,myOrders(req),v,errors),'support/cases',400)
  const c={id:id(),kind:'support',category:v.category,subject:v.subject,message:v.message,status:'Received — pending support review',orderId:o?.id||null,createdAt:new Date().toISOString(),updates:[]};accountState(req).cases.push(c)
  res.redirect(`${res.locals.base}/en-us/support/cases/${c.id}`)
 })
 router.get('/en-us/support/cases',gate,(req,res)=>renderPage(req,res,'Support cases',`${link(res.locals.base,'support/contact','Open a support case')}<div class="ps-transaction-list">${accountState(req).cases.map(c=>`<a href="${res.locals.base}/en-us/support/cases/${c.id}"><div><b>${esc(c.subject)}</b><p>${esc(c.status)} · ${date(c.createdAt)}</p></div><span>›</span></a>`).join('')}</div>${!accountState(req).cases.length?'<p>You have no support cases.</p>':''}`,'support/cases'))
 const casePage=(req,res,c,errors=[],value='',status=200)=>renderPage(req,res,c.subject,`<p>Case <b data-case-id>${esc(c.id)}</b> · ${date(c.createdAt)}</p><p class="ps-notice" role="status">${esc(c.status)}</p><p>We have received your request.${c.kind==='refund'?' Your license stays active and no refund is issued until the review is complete.':' Our support team will review it and update this case.'}</p>${c.orderId?`<p>${link(res.locals.base,`transactions/${c.orderId}`,'Related transaction')}</p>`:''}<h2>${esc(c.category)}</h2><p class="ps-preserve-lines">${esc(c.message)}</p>${c.kind==='refund'?`<p>Downloaded / preloaded / streamed: ${esc(c.answers.downloaded)}. Game launched: ${esc(c.answers.launched)}. Faulty content: ${esc(c.answers.faulty)}.</p><p>Eligibility needs review.</p>`:''}<h2>Follow-up information</h2>${c.updates.map(u=>`<div class="ps-case-update"><time>${date(u.at)}</time><p class="ps-preserve-lines">${esc(u.message)}</p></div>`).join('')}${errorBox(errors)}<form class="ps-journey-form" method="post" action="${res.locals.base}/en-us/support/cases/${c.id}">${textArea('message','Add information',value)}${button('Add to case')}</form>`,'support/cases',status)
 router.get('/en-us/support/cases/:id',gate,(req,res)=>{const c=accountState(req).cases.find(c=>c.id===req.params.id);return c?casePage(req,res,c):missing(req,res)})
 router.post('/en-us/support/cases/:id',gate,(req,res)=>{const c=accountState(req).cases.find(c=>c.id===req.params.id);if(!c)return missing(req,res);const message=scalar(req.body.message);if(message.length<10||message.length>2000)return casePage(req,res,c,['Enter 10–2000 characters.'],message,400);c.updates.push({at:new Date().toISOString(),message});res.redirect(`${res.locals.base}/en-us/support/cases/${c.id}`)})
 router.get('/en-us/support/:topic',(req,res)=>{
  const a=ARTICLES.find(a=>a[0]===req.params.topic);if(!a)return missing(req,res)
  const b=res.locals.base;render(req,res,{title:a[1],body:`<section class="ps-section ps-support-article">${link(b,'support','‹ Support home')}<p>${esc(a[2])}</p><h1>${esc(a[1])}</h1><p>${esc(a[3])}</p><h2>Next steps</h2><div class="ps-support-actions">${link(b,a[0]==='refunds'||a[0]==='preorders'?'transactions':a[0]==='subscriptions'?'membership':'library',a[0]==='refunds'||a[0]==='preorders'?'Transaction History':a[0]==='subscriptions'?'Manage subscriptions':'Game Library')}${link(b,'support/contact','Contact support')}</div></section>`})
 })
 router.get('/en-us/payment-management',gate,(req,res)=>{
  const b=res.locals.base,w=wallet(req)
  renderPage(req,res,'Payment Management',`<p>Wallet Balance <b>$0.00</b></p><p>Add payment methods while checking out. Only masked payment references are saved.</p>${w.instruments.map(i=>`<div class="ps-payment-row"><span>${esc(i.type==='card'?`${i.brand} · Card ending in ${i.last4}`:'PayPal')}${i.default?' · Default':''}</span><form method="post" action="${b}/en-us/payment-management/remove"><input type="hidden" name="id" value="${esc(i.id)}">${button('Remove','outline')}</form></div>`).join('')}${!w.instruments.length?'<p>No saved payment methods.</p>':''}`,'payment-management')
 })
 router.post('/en-us/payment-management/remove',gate,(req,res)=>{const w=wallet(req),key=scalar(req.body.id);if(!w.instruments.some(i=>i.id===key))return missing(req,res);w.instruments=w.instruments.filter(i=>i.id!==key);if(w.selected===key)w.selected=null;req.store.checkout.review=null;res.redirect(`${res.locals.base}/en-us/payment-management`)})
 router.get('/en-us/membership',gate,(req,res)=>{
  const b=res.locals.base,m=accountState(req).membership,active=membershipActive(m)
  const cards=PRODUCTS.filter(p=>p.fictional&&p.plusTag==='Extra'&&!p.includedSkus?.length)
  renderPage(req,res,'PlayStation Plus',`<div class="ps-membership-banner"><p>PLAYSTATION PLUS</p><h2>${m?`${esc(m.tier)} · ${active?'Active':'Membership ended'}`:'No active membership'}</h2><p>Manage your plan, renewal preference and Game Catalog. Each membership period lasts 30 days.</p></div>${m?`<dl class="ps-info-table"><div><dt>Current period ends</dt><dd>${date(m.endsAt)}</dd></div><div><dt>Renewal preference</dt><dd>${m.renew?'On':'Off'}</dd></div></dl><p>${m.renew?'Your renewal preference has been saved.':'Renewal cancelled. Access continues until the current period ends.'}</p>${active?`<form method="post" action="${b}/en-us/membership/renewal"><input type="hidden" name="action" value="${m.renew?'cancel':'reactivate'}">${button(m.renew?'Cancel renewal':'Reactivate renewal')}</form>`:''}`:''}<h2>${active?'Change plan':'Choose your plan'}</h2><form class="ps-journey-form" method="post" action="${b}/en-us/membership"><p>Essential includes membership settings. Extra and Premium also provide access to the games listed below.</p>${select('tier','Plan',[['Essential','Essential'],['Extra','Extra'],['Premium','Premium']],m?.tier||'Extra')}${button(active?'Change plan':'Start membership')}</form><h2>Included in the Game Catalog</h2><div class="ps-journey-products">${cards.map(p=>`<article class="ps-journey-product">${art(p)}<h3>${esc(p.title)}</h3><p>Extra / Premium</p>${m?.claims.includes(p.id)?link(b,`library/${p.id}`,'View catalog entitlement'):catalogAllowed(m,p)?`<form method="post" action="${b}/en-us/membership/claim"><input type="hidden" name="sku" value="${p.id}">${button('Add catalog game')}</form>`:'<p>Available with Extra or Premium.</p>'}</article>`).join('')}</div><p>Purchased licenses remain separate from catalog claims. Changing to Essential ends Extra catalog access immediately. ${link(b,'support/subscriptions','Membership help')}</p>`,'membership')
 })
 router.post('/en-us/membership',gate,(req,res)=>{
  const tier=scalar(req.body.tier),s=accountState(req)
  if(!['Essential','Extra','Premium'].includes(tier))return renderPage(req,res,'PlayStation Plus','<p role="alert">Choose a supported membership plan.</p>'+link(res.locals.base,'membership','Return to membership'),'membership',400)
  const old=s.membership,active=membershipActive(old)
  s.membership={tier,startedAt:active?old.startedAt:new Date().toISOString(),endsAt:active?old.endsAt:new Date(Date.now()+30*86400000).toISOString(),renew:active?old.renew:true,claims:old?.claims||[]}
  res.redirect(`${res.locals.base}/en-us/membership`)
 })
 router.post('/en-us/membership/renewal',gate,(req,res)=>{
  const m=accountState(req).membership,action=scalar(req.body.action)
  if(!membershipActive(m)||!['cancel','reactivate'].includes(action))return renderPage(req,res,'PlayStation Plus','<p>Choose a valid action for an active membership.</p>','membership',400)
  m.renew=action==='reactivate';res.redirect(`${res.locals.base}/en-us/membership`)
 })
 router.post('/en-us/membership/claim',gate,(req,res)=>{
  const m=accountState(req).membership,p=byId(scalar(req.body.sku))
  if(!catalogAllowed(m,p))return renderPage(req,res,'PlayStation Plus','<p>This content needs an active eligible membership.</p>','membership',400)
  if(!m.claims.includes(p.id))m.claims.push(p.id)
  res.redirect(`${res.locals.base}/en-us/library/${encodeURIComponent(p.id)}`)
 })
}
