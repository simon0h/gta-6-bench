import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'
import { PRODUCTS, byId, filterProducts, productPath, FACETS, COLLECTIONS } from '../stores/xbox-store/data.js'

const B='/xbox-store'
const path=id=>productPath(B,byId(id))
const CARD={pi:'new',payType:'card',cardNumber:'4242424242424242',expMonth:'12',expYear:'2029',cvv:'123',nameOnCard:'Alex Tester',address1:'123 Ocean Dr',address2:'',city:'Miami',state:'FL',zip:'33139',country:'US'}
async function login(c,email='tester@example.com') {
  await c.post(`${B}/login.live.com/oauth20_authorize.srf`,{loginfmt:email})
  await c.post(`${B}/login.live.com/password.srf`,{passwd:'Password123!'})
  return c.post(`${B}/login.live.com/kmsi.srf`,{kmsi:'yes'})
}
async function purchase(c,id,values=CARD){
  const pay=await c.get(`${path(id)}/buy`)
  const confirm=await c.post(`${path(id)}/buy`,{...values,payment_token:fieldValue(pay.text,'payment_token')})
  assert.equal(confirm.status,200)
  assert.match(confirm.url,/\/buy\/confirm$/)
  return c.post(`${path(id)}/buy/confirm`,{confirm_token:fieldValue(confirm.text,'confirm_token')})
}

test('Xbox catalogue: 24 ordinary families, populated discovery scopes, ten facets and stable nine sorts',async()=>{
  const ordinary=PRODUCTS.filter(p=>!p.physical&&p.family!=='gta-vi'&&p.type==='game'&&p.purchasable)
  assert.equal(new Set(ordinary.map(p=>p.family)).size,24)
  assert.ok(ordinary.every(p=>p.kind==='other'))
  assert.equal(FACETS.length,10)
  assert.equal(PRODUCTS.length,500)
  const racing=filterProducts(PRODUCTS.filter(p=>p.type==='game'),{genre:'Racing & flying',platform:'PC',sort:'price-asc'})
  assert.deepEqual(racing.map(p=>p.id),['neon-circuit','forza-horizon-5','forza-horizon-5-premium'])
  assert.deepEqual(filterProducts(PRODUCTS,{price:'0'}).map(p=>p.id),['bt5p2x999vh2','roblox','halo-infinite'])
  assert.ok(filterProducts(PRODUCTS,{subscription:'PC',accessibility:'Narrated menus'}).some(p=>p.id==='age-of-empires-iv'))
  assert.ok(filterProducts(PRODUCTS,{handheld:'Optimized',age:'E'}).some(p=>p.id==='pocket-garden'))
  assert.ok(filterProducts(PRODUCTS,{feature:'120 fps',multiplayer:'Single player',language:'German'}).some(p=>p.id==='ori-wisps'))
  const srv=await startServer()
  try {
    const c=srv.client()
    const browse=await c.get(`${B}/en-US/games/browse`)
    assert.match(browse.text,/25 of 300 results shown/)
    assert.equal((browse.text.match(/<option value="(?:relevance|release|popular|price-asc|price-desc|wishlisted|discount|name|name-desc)"/g)||[]).length,9)
    const more=await c.get(`${B}/en-US/games/browse?limit=50`)
    assert.match(more.text,/50 of 300 results shown/)
    assert.doesNotMatch(more.text,/>Load more</)
    const composed=await c.get(`${B}/en-US/games/browse?genre=Racing+%26+flying&platform=PC&sort=price-asc`)
    assert.match(composed.text,/3 of 3 results shown/)
    assert.match(composed.text,/Remove Genre: Racing &amp; flying/)
    assert.match(composed.text,/Clear all filters/)
    assert.ok(composed.text.indexOf('aria-label="Neon Circuit,')<composed.text.indexOf('aria-label="Forza Horizon 5,'))
    const empty=await c.get(`${B}/en-US/search/results?q=zzzz-unfindable&price=0`)
    assert.match(empty.text,/No results found/);assert.match(empty.text,/Try one of these games/)
    for(const group of COLLECTIONS){
      assert.ok(PRODUCTS.some(group.test),group.id)
      const page=await c.get(`${B}/en-US/games/collection/${group.id}`)
      assert.equal(page.status,200);assert.match(page.text,/class="xb-tile"/)
    }
    for(const route of ['genres','platforms','genre/Strategy','platform/PC'])assert.equal((await c.get(`${B}/en-US/games/${route}`)).status,200)
    const gp=await c.get(`${B}/en-US/xbox-game-pass`)
    assert.match(gp.text,/Choose your plan/);assert.match(gp.text,/PC Game Pass/)
  }finally{await srv.close()}
})

test('Xbox product types: ordinary metadata, edition links, base listing, DLC and currency requirements',async()=>{
  const srv=await startServer()
  try{
    const c=srv.client()
    const mc=await c.get(path('9mvxmvt8zkwc'))
    assert.match(mc.text,/Everyone 10\+/);assert.match(mc.text,/Online up to 8/);assert.match(mc.text,/Minecraft: Deluxe Collection/)
    assert.doesNotMatch(mc.text,/RATING PENDING|This content is locked/)
    assert.match(mc.text,/Original illustrative cover/)
    const halo=await c.get(path('halo-infinite'))
    assert.match(halo.text,/Multiplayer|multiplayer/);assert.match(halo.text,/>GET<\/span>/)
    const base=await c.get(path('minecraft-base'))
    assert.match(base.text,/Not sold separately/)
    assert.equal((await c.post(`${path('minecraft-base')}/preorder`)).status,404)
    const dlc=await c.get(path('cuphead-last-course'))
    assert.match(dlc.text,/Requires a game/);assert.match(dlc.text,/Cuphead, sold separately/)
    const coins=await c.get(path('minecraft-minecoins'))
    assert.match(coins.text,/Consumable currency/);assert.match(coins.text,/may be purchased again/)
  }finally{await srv.close()}
})

test('Xbox paid, free, DLC and repeatable currency acquisitions retain correct trusted entitlements and zero totals',async()=>{
  const srv=await startServer()
  try{
    const c=srv.client();await login(c)
    const paid=await purchase(c,'cuphead')
    assert.match(paid.text,/Game license acquired/)
    assert.doesNotMatch(paid.text,/Add-on items require|unlock on 11\/18\/2026/)
    const free=await purchase(c,'halo-infinite',{})
    assert.match(free.text,/No payment required/);assert.match(free.text,/\$0\.00 \(includes \$0\.00 tax\)/)
    const dlc=await purchase(c,'cuphead-last-course',{pi:'0'})
    assert.match(dlc.text,/Add-on license acquired. Requires Cuphead/)
    const coins=await purchase(c,'minecraft-minecoins',{pi:'0'})
    assert.match(coins.text,/1600 currency units/)
    await purchase(c,'minecraft-minecoins',{pi:'0'})
    const orders=await c.json('/api/orders?store=xbox-store')
    assert.equal(orders.length,5)
    assert.ok(orders.every(o=>o.items.every(i=>i.kind==='other')&&o.shipping_address===null))
    assert.deepEqual(orders[1].totals,{subtotal:0,shipping:0,tax:0,total:0})
    assert.deepEqual(orders[1].payment,{method:'free'})
    assert.equal(orders[0].meta.entitlements[0].type,'game')
    assert.equal(orders[2].meta.entitlements[0].type,'dlc')
    assert.equal(orders[3].meta.entitlements[0].type,'consumable')
    assert.equal(orders[3].meta.entitlements[0].quantity,1600)
    const other=srv.client();await login(other)
    assert.equal((await other.get(paid.url)).status,404)
    assert.doesNotMatch((await other.get(`${B}/account/billing/orders`)).text,new RegExp(orders[0].order_number))
    await c.get(`${B}/signout`)
    assert.equal((await c.get(paid.url)).status,404)
  }finally{await srv.close()}
})

test('Xbox direct reviews reject stale prices, old tokens, invalid payment options and repeated scalar fields',async()=>{
  const srv=await startServer(),p=byId('cuphead'),originalPrice=p.price
  try{
    const c=srv.client();await login(c)
    const pay=await c.get(`${path(p.id)}/buy`)
    let bad=await c.post(`${path(p.id)}/buy`,{...CARD,pi:'__proto__',payment_token:fieldValue(pay.text,'payment_token')})
    assert.equal(bad.status,400);assert.doesNotMatch(bad.text,/4242424242424242/)
    bad=await c.post(`${path(p.id)}/buy`,{...CARD,payType:'cash',payment_token:fieldValue(pay.text,'payment_token')})
    assert.equal(bad.status,400)
    const repeated=new URLSearchParams(CARD);repeated.append('nameOnCard','Injected')
    assert.equal((await c.post(`${path(p.id)}/buy`,repeated)).status,400)
    p.price=24.99
    bad=await c.post(`${path(p.id)}/buy`,{...CARD,payment_token:fieldValue(pay.text,'payment_token')})
    assert.equal(bad.status,409);assert.match(bad.text,/value="Alex Tester"/);assert.doesNotMatch(bad.text,/4242424242424242/)
    p.price=originalPrice
    const fresh=await c.get(`${path(p.id)}/buy`)
    const conf1=await c.post(`${path(p.id)}/buy`,{...CARD,payment_token:fieldValue(fresh.text,'payment_token')})
    const conf2=await c.post(`${path(p.id)}/buy`,{pi:'0',payment_token:fieldValue(fresh.text,'payment_token')})
    assert.notEqual(fieldValue(conf1.text,'confirm_token'),fieldValue(conf2.text,'confirm_token'))
    assert.equal((await c.post(`${path(p.id)}/buy/confirm`,{confirm_token:fieldValue(conf1.text,'confirm_token')})).status,409)
    const fresh2=await c.get(`${path(p.id)}/buy`)
    const conf3=await c.post(`${path(p.id)}/buy`,{pi:'0',payment_token:fieldValue(fresh2.text,'payment_token')})
    p.price=29.99
    assert.equal((await c.post(`${path(p.id)}/buy/confirm`,{confirm_token:fieldValue(conf3.text,'confirm_token')})).status,409)
    assert.deepEqual(await c.json('/api/orders?store=xbox-store'),[])
  }finally{p.price=originalPrice;await srv.close()}
})

test('Xbox cart binds rendered account, SKU, price and availability, and a free cart needs no card',async()=>{
  const srv=await startServer(),p=byId('cuphead'),originalPrice=p.price
  try{
    const c=srv.client();await login(c)
    await c.post(`${B}/en-US/cart/add`,{pid:p.id})
    const old=await c.get(`${B}/en-US/checkout`)
    await c.post(`${B}/en-US/cart/add`,{pid:'pocket-garden'})
    let stale=await c.post(`${B}/en-US/checkout`,{...CARD,action:'place',checkout_token:fieldValue(old.text,'checkout_token')})
    assert.equal(stale.status,409);assert.match(stale.text,/value="Alex Tester"/);assert.doesNotMatch(stale.text,/4242424242424242/)
    const latest=await c.get(`${B}/en-US/checkout`)
    p.price=21.99
    stale=await c.post(`${B}/en-US/checkout`,{...CARD,action:'place'})
    assert.equal(stale.status,409,'tokenless legacy submission cannot evade changed review')
    p.price=originalPrice;p.available=false
    assert.equal((await c.post(`${B}/en-US/checkout`,{...CARD,action:'place',checkout_token:fieldValue(latest.text,'checkout_token')})).status,409)
    p.available=true
    await c.post(`${B}/en-US/cart/update`,{pid:p.id,action:'remove'})
    await c.post(`${B}/en-US/cart/update`,{pid:'pocket-garden',action:'remove'})
    await c.post(`${B}/en-US/cart/add`,{pid:'roblox'})
    const free=await c.get(`${B}/en-US/checkout`)
    assert.doesNotMatch(free.text,/name="cardNumber"/)
    assert.match(free.text,/No payment method needed/)
    const done=await c.post(`${B}/en-US/checkout`,{action:'place',checkout_token:fieldValue(free.text,'checkout_token')})
    assert.match(done.text,/Thanks for your purchase/)
    await c.post(`${B}/en-US/checkout`,{action:'place',checkout_token:fieldValue(free.text,'checkout_token')})
    const orders=await c.json('/api/orders?store=xbox-store');assert.equal(orders.length,1);assert.equal(orders[0].totals.total,0)
  }finally{p.price=originalPrice;p.available=true;await srv.close()}
})

test('Xbox review and receipt authorization survives account switching and rejects confirmation replay',async()=>{
  const srv=await startServer()
  try{
    const c=srv.client();await login(c)
    const paid=await purchase(c,'cuphead')
    await c.post(`${B}/en-US/cart/add`,{pid:'grounded'})
    const old=await c.get(`${B}/en-US/checkout`)
    const pay=await c.get(`${path('pocket-garden')}/buy`)
    const conf=await c.post(`${path('pocket-garden')}/buy`,{pi:'0',payment_token:fieldValue(pay.text,'payment_token')})
    const create=await c.post(`${B}/signup.live.com/signup`,{email:'xbox-second@example.com',password:'Password123!',firstName:'Sam',lastName:'Second',birthMonth:'1',birthDay:'2',birthYear:'1990'})
    assert.equal(create.status,200)
    assert.equal((await c.get(paid.url)).status,404)
    assert.equal((await c.post(`${B}/en-US/checkout`,{...CARD,action:'place'})).status,409,'account switches also reject tokenless stale reviews')
    assert.equal((await c.post(`${B}/en-US/checkout`,{...CARD,action:'place',checkout_token:fieldValue(old.text,'checkout_token')})).status,409)
    const skipped=await c.post(`${path('pocket-garden')}/buy/confirm`,{confirm_token:fieldValue(conf.text,'confirm_token')})
    assert.match(skipped.url,/\/buy$/)
    assert.equal((await c.json('/api/orders?store=xbox-store')).length,1)
    const free=await purchase(c,'roblox',{})
    assert.match(free.text,/Thanks for your purchase/)
    await c.post(`${path('roblox')}/buy/confirm`)
    assert.equal((await c.json('/api/orders?store=xbox-store')).length,2)
  }finally{await srv.close()}
})
