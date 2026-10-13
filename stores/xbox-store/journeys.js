import { shippingReceipt } from '../playstation-store/physical.js'
import { findAccount } from '../../lib/accounts.js'
import { randomBytes } from 'node:crypto'
import { esc, money } from '../../lib/html.js'
import { appendOrderEvent } from '../../lib/orders.js'
import { byId, PRODUCTS, PLAN_DATA, productPath, isBuyable } from './data.js'
import * as P from './pages.js'
import { accountState, ownedOrders, ownedOrder, library, lifecycle, statusLabel, token, validToken, activeSubscription, canCancel, canRefund } from './journey-state.js'

const hidden = value => `<input type="hidden" name="service_token" value="${esc(value)}">`
const button = (text) => `<button class="xb-btn xb-btn-buy" type="submit">${text}</button>`
const nav = (base,path) => `<nav class="xb-account-nav" aria-label="Microsoft account"><a href="${base}/account">Overview</a><a href="${base}/account/profile">Your info</a><a href="${base}/account/library">My library</a><a href="${base}/en-US/wishlist">Wish list</a><a href="${base}/account/billing/orders">Order history</a><a href="${base}/account/services">Services &amp; subscriptions</a><a href="${base}/en-US/support/cases">Support cases</a></nav>`.replaceAll(/<a href="([^"]+)"/g,(tag,href)=>tag+(path.split('?')[0]===href?' aria-current="page"':''))
const card = (title,body) => `<section class="xb-service-card"><h2>${esc(title)}</h2>${body}</section>`
const link = (url,title) => `<a class="xb-btn xb-btn-grey" href="${url}">${esc(title)}</a>`
const field = (name,label,value='',type='text') => `<div class="xb-field"><label for="${name}">${esc(label)}</label><input id="${name}" name="${name}" type="${type}" value="${esc(value)}" maxlength="120" required></div>`
const notice = message => message ? `<p class="xb-service-notice" role="status">${esc(message)}</p>` : ''
const limitation = '<p class="xb-fine">Account services run locally here. No console installation, cloud play, real subscription charge, email or bank refund is performed.</p>'
const TOPICS = [
  {id:'purchases',title:'Purchases, pre-orders and refunds',text:'Find your transaction in Order history. Eligible pre-orders can be cancelled before the billing window, more than 10 days before release. Other paid non-consumable purchases made within 14 days can be submitted for refund review. A request does not guarantee a refund; the license stays visible while review is pending.',route:'/account/billing/orders',action:'Open order history'},
  {id:'subscriptions',title:'Manage Game Pass and recurring billing',text:'Your plan provides subscription access to included games until the access end date. Turn recurring billing off to keep access through the paid period. Turning it back on changes your renewal preference. Buying a game separately grants a permanent license, even after a subscription expires.',route:'/account/services',action:'Manage subscriptions'},
  {id:'installation',title:'Find your games and add-ons',text:'Open My library to see games, bundles, add-ons and currency records. On your own Xbox, sign into the same Microsoft account and open My games & apps, then Full library. Check the product devices before installing. Add-ons need their required base game; currency records are purchases, not a playable game or live wallet balance.',route:'/account/library',action:'Open my library'},
  {id:'redeem',title:'Redeem gift cards and digital codes',text:'Microsoft codes usually have 25 characters in five groups. Check the account, region and code type before redemption. A code marked already redeemed should be checked in the original account history. Never send your full code in a support message. This storefront can check formatting and show guidance; it cannot redeem live Microsoft codes.',route:'/en-US/redeem',action:'Check code format'},
  {id:'account',title:'Account, privacy and sign-in',text:'Use your Microsoft account email to sign in. Saved games, service preferences and cases belong to the signed-in account in this browser session. Sign out on shared devices. This store never asks for a password in a support case; password recovery for a live Microsoft account is outside this service.',route:'/account/profile',action:'Manage your information'},
  {id:'accessibility',title:'Accessibility and supported devices',text:'Use the Accessibility and Play with filters while browsing games. A game page lists narrated menus, subtitles, input support and other declared features. Features differ between editions and devices; a Game Pass badge does not promise every accessibility option.',route:'/en-US/games/browse',action:'Explore game filters'},
]

export function installJourneys(router,{render,signinWall,notFound}) {
  const show=(req,res,title,body,status=200)=>render(req,res,title,`<div class="xb-services ${req.path.startsWith('/en-US/support')?'xb-support-services':''}">${req.store.user?nav(res.locals.base,req.originalUrl):''}<h1>${esc(title)}</h1>${body}</div>`,{status})
  const gate=(req,res,next)=>req.store.user?next():signinWall(req,res,req.originalUrl)
  const stale=(req,res,url)=>show(req,res,'Review your changes',`<p>Your account or the form changed. Open the current page and try again.</p>${link(url,'Review current information')}`,409)

  router.get('/account',gate,(req,res)=>{
    const b=res.locals.base,s=accountState(req),sub=activeSubscription(req)
    show(req,res,'Microsoft account',`<p class="xb-service-intro">Welcome, ${esc(req.store.user.first_name||req.store.user.email)}. Manage your digital games and account.</p><div class="xb-service-grid">${card('Your information',`<p>${esc(req.store.user.email)}</p>${link(b+'/account/profile','Edit profile and preferences')}`)}${card('My library',`<p>${library(req).length} acquired items</p>${link(b+'/account/library','View library')}`)}${card('Wish list',`<p>${s.wishlist.length} saved games and add-ons</p>${link(b+'/en-US/wishlist','View wish list')}`)}${card('Services & subscriptions',`<p>${sub?`Game Pass ${esc(sub.plan)} · ${sub.recurring?'Recurring billing on':'Expires at period end'}`:'No active Game Pass plan'}</p>${link(b+'/account/services','Manage services')}`)}${card('Payment & billing',`<p>${ownedOrders(req).length} transactions in this account session</p>${link(b+'/account/billing/orders','View order history')}`)}${card('Support',`<p>${s.cases.length} support cases</p>${link(b+'/en-US/support','Get help')}`)}</div>${limitation}`)
  })
  function profile(req,res,values={},error='',status=200){
    const s=accountState(req),v={first_name:req.store.user.first_name,last_name:req.store.user.last_name,...s.preferences,...values}
    show(req,res,'Your info',`${notice(error)}<p>${esc(req.store.user.email)} · United States</p><form class="xb-service-form" method="post">${hidden(token(req,'profile'))}${field('first_name','First name',v.first_name)}${field('last_name','Last name',v.last_name)}<div class="xb-field"><label for="language">Preferred language</label><select id="language" name="language">${['English','Spanish'].map(x=>`<option ${v.language===x?'selected':''}>${x}</option>`).join('')}</select></div><div class="xb-field"><label for="notifications">Store offer preference</label><select id="notifications" name="notifications"><option value="off" ${v.notifications==='off'?'selected':''}>Off</option><option value="on" ${v.notifications==='on'?'selected':''}>On</option></select></div><p class="xb-fine">This saves your preference; no messages are sent. Store pages remain in English.</p>${button('Save changes')}</form><p>${link(res.locals.base+'/signout','Sign out')}</p>`,status)
  }
  router.get('/account/profile',gate,(req,res)=>profile(req,res))
  router.post('/account/profile',gate,(req,res)=>{
    const v=req.body
    if(!validToken(req,'profile',v.service_token))return stale(req,res,res.locals.base+'/account/profile')
    if(!v.first_name?.trim()||!v.last_name?.trim()||[v.first_name,v.last_name].some(x=>x.length>60)||!['English','Spanish'].includes(v.language)||!['on','off'].includes(v.notifications))return profile(req,res,v,'Enter both names (up to 60 characters) and choose the listed preferences.',400)
    req.store.user={...req.store.user,first_name:v.first_name.trim(),last_name:v.last_name.trim()}
    const s=accountState(req);s.profile={first_name:req.store.user.first_name,last_name:req.store.user.last_name};s.preferences={language:v.language,notifications:v.notifications}
    profile(req,res,{},'Your changes have been saved.')
  })

  router.post('/en-US/wishlist',(req,res)=>{
    const p=byId(req.body.pid),action=req.body.action||'add'
    if(!p||!['add','remove'].includes(action))return show(req,res,'Check your wish list selection','<p>Choose a listed game or add-on.</p>',400)
    if(!req.store.user){if(action==='add')req.store.checkout.pendingWishlist=p.id;return signinWall(req,res,res.locals.base+'/en-US/wishlist')}
    if(!validToken(req,`wishlist-${p.id}`,req.body.service_token,p.id,true))return stale(req,res,productPath(res.locals.base,p))
    const s=accountState(req)
    s.wishlist=action==='remove'?s.wishlist.filter(id=>id!==p.id):[...new Set([...s.wishlist,p.id])]
    res.redirect(res.locals.base+'/en-US/wishlist')
  })
  router.get('/en-US/wishlist',gate,(req,res)=>{
    const b=res.locals.base,s=accountState(req)
    show(req,res,'Wish list',s.wishlist.length?`<div class="xb-service-grid">${s.wishlist.map(byId).filter(Boolean).map(p=>card(p.title,`${P.artwork(p)}<p>${money(p.price||0)}</p>${link(productPath(b,p),'View game')}<form method="post">${hidden(token(req,`wishlist-${p.id}`,p.id))}<input type="hidden" name="pid" value="${p.id}"><input type="hidden" name="action" value="remove">${button('Remove from wish list')}</form>`)).join('')}</div>`:`<p>Your wish list is empty. Save games from the product menu to find them here.</p>${link(b+'/en-US/games/browse','Browse games')}`)
  })

  router.get('/account/library',gate,(req,res)=>{
    const b=res.locals.base,type=String(req.query.type||'all'),q=String(req.query.q||'').slice(0,120),entries=library(req),sub=activeSubscription(req)
    const allowed=['all','game','bundle','dlc','consumable','preorder','subscription']
    if(!allowed.includes(type))return show(req,res,'My library','<p>Choose a listed library filter.</p>',400)
    const matches=entries.filter(e=>(type==='all'||e.type===type||(type==='preorder'&&e.preorder))&&e.title.toLowerCase().includes(q.toLowerCase()))
    const included=sub&&['all','subscription'].includes(type)?PRODUCTS.filter(p=>isBuyable(p)&&p.subscriptions.includes(sub.plan)&&p.title.toLowerCase().includes(q.toLowerCase())):[]
    show(req,res,'My library',`<form class="xb-service-search" method="get"><label for="library-q">Find a game</label><input id="library-q" name="q" value="${esc(q)}"><label for="library-type">License type</label><select id="library-type" name="type">${allowed.map(x=>`<option value="${x}" ${type===x?'selected':''}>${esc({all:'All items',game:'Games',bundle:'Bundles',dlc:'Add-ons',consumable:'Currency',preorder:'Pre-orders',subscription:'Game Pass'}[x])}</option>`).join('')}</select>${button('Filter library')}</form><div class="xb-service-grid">${matches.map(e=>card(e.title,`${byId(e.sku)?P.artwork(byId(e.sku)):''}<p class="xb-license-status">${e.preorder?`Pre-order · unlocks ${esc(e.release)}`:e.type==='consumable'?`${e.quantity} currency units purchased`:e.type==='dlc'?'Add-on license':e.type==='bundle'?'Bundle license':'Owned game license'}</p>${e.requires?`<p>Requires ${esc(byId(e.requires)?.title||e.requires)}</p>`:''}${e.included_games.length?`<p>Includes ${e.included_games.map(esc).join(', ')}</p>`:''}<p>${esc(e.platforms.join(' · '))}</p>${link(`${b}/account/library/${encodeURIComponent(e.sku)}`,'Manage item')}`)).join('')}${included.map(p=>card(p.title,`${P.artwork(p)}<p class="xb-license-status">Game Pass ${esc(sub.plan)} access through ${esc(sub.expires_at.slice(0,10))}</p>${link(productPath(b,p),'View game')}`)).join('')}</div>${!matches.length&&!included.length?'<p>No items match. Acquired games and add-ons will appear here.</p>':''}<p>${link(b+'/en-US/support/installation','Installation and add-on guidance')}</p>${limitation}`)
  })
  router.get('/account/library/:sku',gate,(req,res)=>{
    const e=library(req).find(x=>x.sku===req.params.sku)
    if(!e)return notFound(req,res)
    const b=res.locals.base,all=library(req).filter(x=>x.sku===e.sku)
    show(req,res,e.title,`${card('License details',`<p>${e.preorder?`Pre-order reserved. Unlocks ${esc(e.release)}.`:e.type==='consumable'?`${all.reduce((n,x)=>n+x.quantity,0)} currency units purchased across ${all.length} transactions. This is a purchase record, not a live game balance.`:`${esc(e.type)} license acquired.`}</p><p>Supported devices: ${esc(e.platforms.join(', '))}</p>${e.requires?`<p>Requires ${esc(byId(e.requires)?.title||e.requires)}. Owning this item does not grant the base game.</p>`:''}<p>${link(b+'/en-US/support/installation','How to install on your device')}</p>`)}${card('Transactions',all.map(x=>`<p><a href="${b}/account/billing/orders/${x.order.order_number}">Order ${x.order.order_number}</a> · ${esc(statusLabel(x.order))}</p>`).join(''))}${limitation}`)
  })

  router.get('/account/billing/orders',gate,(req,res)=>{
    const b=res.locals.base,filter=String(req.query.status||'all'),period=String(req.query.period||'all')
    if(!['all','preordered','acquired','cancelled','return_requested'].includes(filter)||!['all','30','90'].includes(period))return show(req,res,'Order history','<p>Choose a listed order filter.</p>',400)
    const orders=ownedOrders(req).filter(o=>(filter==='all'||lifecycle(o)===filter)&&(period==='all'||Date.now()-new Date(o.created_at)<Number(period)*86400000)).reverse()
    show(req,res,'Order history',`<p>${esc(req.store.user.email)} · Digital transactions</p><form class="xb-service-search" method="get"><label for="order-status">Status</label><select id="order-status" name="status">${[['all','All transactions'],['preordered','Pre-orders'],['acquired','Acquired'],['cancelled','Cancelled'],['return_requested','Refund requests']].map(([id,label])=>`<option value="${id}" ${filter===id?'selected':''}>${label}</option>`).join('')}</select><label for="period">Purchase date</label><select id="period" name="period">${[['all','All dates'],['30','Last 30 days'],['90','Last 90 days']].map(([id,label])=>`<option value="${id}" ${period===id?'selected':''}>${label}</option>`).join('')}</select>${button('Apply filters')}</form>${orders.length?`<div class="xb-service-table"><table class="xb-table"><thead><tr><th>Order</th><th>Items</th><th>Total</th><th>Status</th></tr></thead><tbody>${orders.map(o=>`<tr><td><a href="${b}/account/billing/orders/${o.order_number}">${o.order_number}</a><br>${esc(o.created_at.slice(0,10))}</td><td>${o.items.map(i=>esc(i.title)).join('<br>')}</td><td>${money(o.totals.total)}</td><td>${esc(statusLabel(o))}</td></tr>`).join('')}</tbody></table></div>`:'<p>You have no orders matching these filters.</p>'}`)
  })
  router.get('/account/billing/orders/:id',gate,(req,res)=>{
    const o=ownedOrder(req,req.params.id);if(!o)return notFound(req,res)
    const b=res.locals.base,path=b+'/account/billing/orders/'+o.order_number
    show(req,res,`Order ${o.order_number}`,`${notice(statusLabel(o))}<p>${esc(o.created_at.slice(0,10))} · ${esc(o.customer.email)}</p>${shippingReceipt(o)}${card(o.shipping_address?'Purchased items':'Digital items',o.items.map(i=>`<p><b>${esc(i.title)}</b> · ${money(i.unit_price)}</p>`).join('')+`<p>${lifecycle(o)==='cancelled'?'This pre-order is cancelled. Its reserved licenses are removed from My library.':o.meta.preorder?`Pre-order unlock dates: ${o.meta.entitlements.filter(e=>e.preorder).map(e=>esc(e.release)).join(', ')}.`:o.shipping_address?'Physical items are preparing for delivery. Any digital licenses are listed separately in My library.':'Your acquired licenses are listed in My library.'}</p>`)}${card('Payment summary',`<p>Subtotal ${money(o.totals.subtotal)} · Tax ${money(o.totals.tax)} · Total ${money(o.totals.total)}</p><p>${esc(o.payment.method==='card'?`${o.payment.brand} ending ${o.payment.last4}`:o.payment.method==='free'?'No payment required':o.payment.method)}</p><p>${lifecycle(o)==='cancelled'?'No bank refund has been issued by this service.':lifecycle(o)==='return_requested'?'Your refund request is pending review. No refund has been issued.':o.meta.preorder?o.shipping_address?'Physical items are charged immediately; digital pre-order payment is scheduled about 10 days before release.':'Pre-order payment is scheduled about 10 days before release.':o.shipping_address?'Physical delivery order recorded.':'Digital purchase recorded.'}</p>`)}<div class="xb-service-actions">${canCancel(o)?link(path+'/cancel','Cancel pre-order'):''}${canRefund(o)?link(path+'/refund','Request a refund'):''}${link(b+'/en-US/support/contact?order='+o.order_number,'Get order help')}${link(b+'/account/library','My library')}</div>${!canCancel(o)&&!canRefund(o)&&!['cancelled','return_requested'].includes(lifecycle(o))?'<p class="xb-fine">This transaction is not eligible for the available self-service actions. Contact support for transactions outside the available self-service actions.</p>':''}${o.meta.lifecycle?.length?card('Request history',o.meta.lifecycle.map(e=>`<p>${esc(e.created_at.slice(0,10))} · ${esc(e.status==='return_requested'?'Refund requested — pending review':'Pre-order cancelled')} · ${esc(e.reason)}</p>`).join('')):''}`)
  })
  for(const action of ['cancel','refund']) {
    const eligible=action==='cancel'?canCancel:canRefund,key=id=>`order-${id}-${action}`
    const reasons=action==='cancel'?['Changed my mind','Ordered the wrong edition']:['Accidental purchase','Technical issue','Not as expected']
    const title=action==='cancel'?'Cancel pre-order':'Request a refund'
    router.get(`/account/billing/orders/:id/${action}`,gate,(req,res)=>{
      const o=ownedOrder(req,req.params.id);if(!o)return notFound(req,res)
      if(!eligible(o))return show(req,res,'Action unavailable',`<p>This transaction is not eligible for ${action==='cancel'?'pre-order cancellation':'a refund request'}.</p>`,409)
      show(req,res,title,`<p>Order ${o.order_number} · ${money(o.totals.total)}</p><form class="xb-service-form" method="post">${hidden(token(req,key(o.id),lifecycle(o)))}<label for="reason">Reason</label><select id="reason" name="reason">${reasons.map(x=>`<option>${x}</option>`).join('')}</select><p>${action==='cancel'?'Cancellation removes the reserved pre-order licenses from your library.':'Your request will be reviewed. Approval and repayment are not automatic.'}</p>${button('Review request')}</form>`)
    })
    router.post(`/account/billing/orders/:id/${action}`,gate,(req,res)=>{
      const o=ownedOrder(req,req.params.id);if(!o)return notFound(req,res)
      const b=res.locals.base,path=`${b}/account/billing/orders/${o.order_number}/${action}`
      if(!eligible(o)||!validToken(req,key(o.id),req.body.service_token,lifecycle(o)))return stale(req,res,path)
      if(!reasons.includes(req.body.reason))return show(req,res,title,`<p>Choose one of the listed reasons.</p>${link(path,'Choose a reason')}`,400)
      req.store.pendingOrderAction={id:o.id,action,reason:req.body.reason,account:req.store.user.id}
      show(req,res,'Review request',`<p>Order ${o.order_number} · ${esc(req.body.reason)}</p><p>${action==='cancel'?'The reserved license will be removed.':'The license remains visible while the refund request is pending. No bank refund is issued here.'}</p><form method="post" action="${path}/confirm">${hidden(token(req,key(o.id)+'-confirm',req.store.pendingOrderAction))}${button(action==='cancel'?'Confirm cancellation':'Submit refund request')}</form>`)
    })
    router.post(`/account/billing/orders/:id/${action}/confirm`,gate,(req,res)=>{
      const o=ownedOrder(req,req.params.id);if(!o)return notFound(req,res)
      const pending=req.store.pendingOrderAction
      if(!pending||pending.id!==o.id||pending.action!==action||pending.account!==req.store.user.id||!eligible(o)||!validToken(req,key(o.id)+'-confirm',req.body.service_token,pending,true))return stale(req,res,res.locals.base+'/account/billing/orders/'+o.order_number)
      appendOrderEvent(o.id,{store:req.storeSlug,session_id:req.session.id,action:action==='cancel'?'cancel':'return',status:action==='cancel'?'cancelled':'return_requested',reason:pending.reason})
      delete req.store.pendingOrderAction
      res.redirect(res.locals.base+'/account/billing/orders/'+o.order_number)
    })
  }

  router.get('/account/services',gate,(req,res)=>{
    const b=res.locals.base,s=accountState(req),sub=activeSubscription(req)
    show(req,res,'Services & subscriptions',`${sub?card('Xbox Game Pass '+sub.plan,`<p>${sub.recurring?'Active · Recurring billing on':'Active · Recurring billing off'}</p><p>Access ${sub.recurring?'renews':'ends'} on ${esc(sub.expires_at.slice(0,10))} · ${money(PLAN_DATA.find(p=>p.id===sub.plan).price)}/month</p><form method="post" action="${b}/account/services/renewal">${hidden(token(req,'renewal',sub))}<input type="hidden" name="action" value="${sub.recurring?'off':'on'}">${button(sub.recurring?'Turn off recurring billing':'Turn on recurring billing')}</form><p>Turning recurring billing off keeps access until the date above.</p>${link(b+'/account/library?type=subscription','View included games')}`):'<p>You have no active Game Pass subscription.</p>'}<div class="xb-service-grid">${PLAN_DATA.map(p=>card(p.id==='PC'?'PC Game Pass':'Game Pass '+p.id,`<p>${money(p.price)}/month · ${esc(p.devices)}</p><p>${esc(p.description)}</p>${link(b+'/account/services/join?plan='+p.id,sub?.plan===p.id?'View current plan':'Choose this plan')}`)).join('')}</div>${s.subscription&&!sub?'<p>Your previous subscription has expired.</p>':''}${limitation}`)
  })
  router.get('/account/services/join',gate,(req,res)=>{
    const plan=PLAN_DATA.find(p=>p.id===req.query.plan);if(!plan)return notFound(req,res)
    const s=accountState(req)
    show(req,res,'Review Game Pass plan',`<p>Game Pass ${esc(plan.id)} · ${money(plan.price)} per month</p><p>${esc(plan.description)}</p><p>Activate a 30-day local subscription record. Changing plans keeps your current access end date. Recurring billing starts on; you can turn it off in Services &amp; subscriptions.</p><form method="post">${hidden(token(req,'subscription',{plan:plan.id,current:s.subscription}))}<input type="hidden" name="plan" value="${plan.id}">${button('Activate plan')}</form>${limitation}`)
  })
  router.post('/account/services/join',gate,(req,res)=>{
    const plan=PLAN_DATA.find(p=>p.id===req.body.plan),s=accountState(req)
    if(!plan)return show(req,res,'Plan unavailable','<p>Choose a listed Game Pass plan.</p>',400)
    if(!validToken(req,'subscription',req.body.service_token,{plan:plan.id,current:s.subscription},true))return stale(req,res,res.locals.base+'/account/services')
    const current=activeSubscription(req)
    s.subscription={id:current?.id||randomBytes(8).toString('hex'),plan:plan.id,recurring:true,started_at:current?.started_at||new Date().toISOString(),expires_at:current?.expires_at||new Date(Date.now()+30*86400000).toISOString()}
    res.redirect(res.locals.base+'/account/services')
  })
  router.post('/account/services/renewal',gate,(req,res)=>{
    const sub=activeSubscription(req)
    if(!sub||!['on','off'].includes(req.body.action)||!validToken(req,'renewal',req.body.service_token,sub,true))return stale(req,res,res.locals.base+'/account/services')
    sub.recurring=req.body.action==='on';res.redirect(res.locals.base+'/account/services')
  })

  router.get('/en-US/support',(req,res)=>{
    const b=res.locals.base,q=String(req.query.q||'').trim().slice(0,120),topics=TOPICS.filter(t=>(t.title+' '+t.text).toLowerCase().includes(q.toLowerCase()))
    show(req,res,'Xbox Support',`<p class="xb-service-intro">How can we help you?</p><form class="xb-service-search" method="get"><label for="help-q">Search support</label><input id="help-q" type="search" name="q" value="${esc(q)}" placeholder="Subscriptions, refunds, install…">${button('Search help')}</form><div class="xb-service-grid">${topics.map(t=>card(t.title,`<p>${esc(t.text.split('. ')[0])}.</p>${link(b+'/en-US/support/'+t.id,'Read help article')}`)).join('')}</div>${!topics.length?'<p>No articles found. Try “refund”, “code” or “Game Pass”.</p>':''}<p>${link(b+'/en-US/support/contact','Contact support')} ${link(b+'/en-US/support/cases','My support cases')}</p>`)
  })
  function contact(req,res,values={},error='',status=200){
    const b=res.locals.base,orders=ownedOrders(req)
    show(req,res,'Contact Xbox Support',`${notice(error)}<form class="xb-service-form" method="post">${hidden(token(req,'support'))}<div class="xb-field"><label for="category">Topic</label><select id="category" name="category">${TOPICS.map(t=>`<option value="${t.id}" ${values.category===t.id?'selected':''}>${esc(t.title)}</option>`).join('')}</select></div>${field('subject','Subject',values.subject||'')}<div class="xb-field"><label for="message">How can we help?</label><textarea id="message" name="message" rows="5" maxlength="2000" required>${esc(values.message||'')}</textarea></div><div class="xb-field"><label for="order_id">Related order (optional)</label><select id="order_id" name="order_id"><option value="">No order</option>${orders.map(o=>`<option value="${o.order_number}" ${values.order_id===o.order_number?'selected':''}>${o.order_number} · ${esc(o.items[0].title)}</option>`).join('')}</select></div><p>Do not include payment card numbers, passwords or redemption codes.</p>${button('Submit case')}</form><p class="xb-fine">Cases are saved for this account session. No message is sent to Microsoft.</p>`,status)
  }
  router.get('/en-US/support/contact',gate,(req,res)=>contact(req,res,{order_id:ownedOrder(req,String(req.query.order||''))?.order_number||''}))
  router.post('/en-US/support/contact',gate,(req,res)=>{
    const v=req.body
    if(!validToken(req,'support',v.service_token))return stale(req,res,res.locals.base+'/en-US/support/contact')
    const containsSecret=/\b(?:\d[ -]?){13,19}\b|\b[A-Z0-9]{5}(?:-[A-Z0-9]{5}){4}\b|(?:password|passwd|cvv|card number)\s*[:=]/i
    const content=(v.subject||'')+' '+(v.message||''),knownPassword=findAccount(req.storeSlug,req.store.user.email)?.password
    if(containsSecret.test(content)||(knownPassword&&content.includes(knownPassword)))return contact(req,res,{category:v.category,subject:'',message:'',order_id:''},'Remove payment details, passwords and redemption codes before submitting.',400)
    if(!TOPICS.some(t=>t.id===v.category)||!v.subject?.trim()||v.subject.length>120||!v.message?.trim()||v.message.length>2000||(v.order_id&&!ownedOrder(req,v.order_id)))return contact(req,res,{category:v.category,subject:(v.subject||'').slice(0,120),message:(v.message||'').slice(0,2000),order_id:v.order_id},'Choose a topic, enter a subject and message, and select an order belonging to this account.',400)
    validToken(req,'support',v.service_token,'',true)
    const c={id:randomBytes(8).toString('hex'),category:v.category,subject:v.subject.trim(),message:v.message.trim(),order_id:v.order_id||null,created_at:new Date().toISOString(),status:'Received'}
    accountState(req).cases.push(c);res.redirect(res.locals.base+'/en-US/support/cases/'+c.id)
  })
  router.get('/en-US/support/cases',gate,(req,res)=>show(req,res,'My support cases',accountState(req).cases.map(c=>card(c.subject,`<p>${esc(c.status)} · ${esc(c.created_at.slice(0,10))}</p>${link(res.locals.base+'/en-US/support/cases/'+c.id,'View case')}`)).join('')||'<p>You have no support cases.</p>'))
  router.get('/en-US/support/cases/:id',gate,(req,res)=>{
    const c=accountState(req).cases.find(c=>c.id===req.params.id);if(!c)return notFound(req,res)
    show(req,res,'Support case '+c.id,`${notice('Case received — pending review')}${card(c.subject,`<p>${esc(c.message)}</p><p>Topic: ${esc(TOPICS.find(t=>t.id===c.category).title)}</p>${c.order_id?`<p><a href="${res.locals.base}/account/billing/orders/${c.order_id}">Order ${c.order_id}</a></p>`:''}`)}<p class="xb-fine">Your case is stored for this account session. No email has been sent and no live support agent is connected.</p>`)
  })
  router.get('/en-US/support/:topic',(req,res)=>{
    const t=TOPICS.find(t=>t.id===req.params.topic);if(!t)return notFound(req,res)
    show(req,res,t.title,`<p class="xb-service-intro">${esc(t.text)}</p>${link(res.locals.base+t.route,t.action)}<p>${link(res.locals.base+'/en-US/support/contact','Still need help?')}</p>`)
  })
  function redeem(req,res,message='',status=200){show(req,res,'Redeem a code',`<p>Check the format of a 25-character Microsoft gift card or game code.</p>${notice(message)}<form class="xb-service-form" method="post">${field('code','Code (five groups of five characters)')}<p>Formatting only: live codes cannot be verified or redeemed here. Your code is not saved.</p>${button('Check format')}</form><p>${link(res.locals.base+'/en-US/support/redeem','Redemption troubleshooting')}</p>`,status)}
  router.get('/en-US/redeem',(req,res)=>redeem(req,res))
  router.post('/en-US/redeem',(req,res)=>redeem(req,res,/^[A-Z0-9]{5}(?:-[A-Z0-9]{5}){4}$/i.test(req.body.code||'')?'The format is correct. Use the redemption screen on your own Xbox or Microsoft account to check validity, region and value. No balance or license has been added.':'Use five groups of five letters or numbers, separated by hyphens.',/^[A-Z0-9]{5}(?:-[A-Z0-9]{5}){4}$/i.test(req.body.code||'')?200:400))
  router.get('/en-US/privacy',(req,res)=>show(req,res,'Privacy and cookies',`<p>This storefront uses a session cookie to keep your cart, account session, wish list and service preferences together. Digital orders record the account identity, item details, totals and a masked payment description. Full card numbers and security codes are not stored in order records.</p><p>Support cases and subscription preferences stay within your account session. Sign out on a shared device. This service does not connect to Microsoft, send marketing email or share records with game publishers.</p>${link(res.locals.base+'/account/profile','Manage preferences')}`))
  router.get('/en-US/terms',(req,res)=>show(req,res,'Store service terms',`<p>Digital products grant licenses; physical games, consoles and accessories ship to the delivery address entered at checkout and grant no digital entitlement. The product page lists the edition, compatible devices, required base games and release date. Consumable currency can be purchased repeatedly; permanent licenses are acquired once per account session.</p><p>Review the current price and estimated tax before confirming. Pre-orders reserve access for the listed release date. Eligible cancellation removes the reserved license; refund requests remain pending and never imply that a bank repayment has occurred.</p><p>Game Pass access ends at the date shown in Services &amp; subscriptions when recurring billing is off. Live console, payment, redemption and Microsoft account services are outside this local storefront.</p>${link(res.locals.base+'/en-US/support','Get service help')}`))
}

export function resumeAccount(req) {
  const s=accountState(req)
  if(!s)return
  if(s.profile)req.store.user={...req.store.user,...s.profile}
  const id=req.store.checkout.pendingWishlist
  if(byId(id))s.wishlist=[...new Set([...s.wishlist,id])]
  delete req.store.checkout.pendingWishlist
}
