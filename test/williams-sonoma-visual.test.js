import { assertProductGallery } from './product-gallery-assertions.js'
import { galleryPrimaryImage, galleryImageUrls } from './helpers.js'
import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'

const base='/williams-sonoma'
const login={email:'tester@example.com',password:'Password123!'}

test('Williams Sonoma retains the selected registry SKU through sign-in, errors and first registry creation',async()=>{
 const srv=await startServer()
 try{
  const c=srv.client(), selection=base+'/account/registries?product=skillet&Finish=Brushed+steel'
  let page=await c.get(selection)
  assert.equal(new URL(page.url).pathname,base+'/account')
  assert.equal(fieldValue(page.text,'next').replaceAll('&amp;','&'),selection)
  page=await c.post(base+'/account',{...login,password:'WrongPassword',next:selection})
  assert.equal(page.status,400)
  assert.equal(fieldValue(page.text,'next').replaceAll('&amp;','&'),selection)
  page=await c.post(base+'/account',{...login,next:fieldValue(page.text,'next').replaceAll('&amp;','&')})
  assert.equal(new URL(page.url).pathname,base+'/account/registries')
  assert.match(page.text,/Finish: Brushed steel/)
  const action=page.text.match(/action="([^\"]*\/account\/registries\?[^\"]*)"/)[1].replaceAll('&amp;','&')
  page=await c.post(action,{name:'',event:'Wedding',notes:'Private first-list note'})
  assert.equal(page.status,400)
  assert.ok(page.text.includes('Finish=Brushed+steel'))
  page=await c.post(action,{name:'Our kitchen',event:'Wedding',notes:'Private first-list note'})
  assert.match(new URL(page.url).pathname,/\/registry-[a-f0-9]+\/add$/)
  assert.match(page.text,/<option value="Brushed steel" selected>/)
  const registryPath=new URL(page.url).pathname.replace(/\/add$/,'')
  page=await c.post(registryPath+'/items',{product:'skillet',option_Finish:'Brushed steel',qty:'1',notes:'Private item note'})
  assert.match(page.text,/\$64\.99 each/)
  const preview=await c.get(registryPath+'/preview')
  assert.match(preview.text,/product\/skillet\?Finish=Brushed\+steel/)
  assert.doesNotMatch(preview.text,/Private first-list note|Private item note|tester@example.com/)
  const pdp=await c.get(base+'/product/skillet?Finish=Brushed+steel')
  assert.equal(fieldValue(pdp.text,'option_Finish'),'Brushed steel')
  page=await c.post(base+'/cart/add',{id:'skillet',option_Finish:fieldValue(pdp.text,'option_Finish'),qty:'1'})
  assert.match(page.text,/\$64\.99/)
  assert.match(page.text,/product\/skillet\?Finish=Brushed\+steel/)
 }finally{await srv.close()}
})

test('Williams Sonoma accepts only local registry continuations and renders the active profile in the header',async()=>{
 const srv=await startServer()
 try{
  const c=srv.client()
  for(const next of ['https://example.com','//example.com','/williams-sonoma/account/registries/../../cart','/williams-sonoma/account/registries\\@example.com']){
   const page=await c.post(base+'/account',{...login,next})
   assert.equal(new URL(page.url).pathname,base+'/account')
   await c.post(base+'/logout',{})
  }
  await c.post(base+'/account',login)
  await c.post(base+'/account/profile',{first_name:'KitchenAlex',last_name:'Cook',phone:''})
  assert.match((await c.get(base+'/')).text,/Hi, KitchenAlex/)
  await c.post(base+'/logout',{})
  await c.post(base+'/account',{mode:'register',email:'visual-other@example.com',password:'OtherPass123!',first_name:'Other',last_name:'Cook'})
  const other=await c.get(base+'/')
  assert.match(other.text,/Hi, Other/)
  assert.doesNotMatch(other.text,/KitchenAlex/)
 }finally{await srv.close()}
})

// A gallery view can survive a finish change in the URL; the active image must still be clear.
test('Williams Sonoma selects the actual available gallery image after changing finishes',async()=>{
 const srv=await startServer()
 try{
  const c=srv.client()
  const sage=await c.get(base+'/product/dutch-oven?Capacity=7+qt&Color=Sage&view=open')
  const sageViews = await assertProductGallery(c, sage.text, 'williams-sonoma', 'dutch-oven')
  assert.equal(galleryPrimaryImage(sage.text), sageViews[2])
  const cream=await c.get(base+'/product/dutch-oven?Capacity=7+qt&Color=Cream&view=open')
  const creamViews = await assertProductGallery(c, cream.text, 'williams-sonoma', 'dutch-oven')
  assert.equal(galleryPrimaryImage(cream.text), creamViews[2])
  assert.notEqual((await c.get(creamViews[2])).text, (await c.get(sageViews[2])).text)
 }finally{await srv.close()}
})
