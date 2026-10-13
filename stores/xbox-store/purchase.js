import { owns } from './journey-state.js'
import { randomBytes } from 'node:crypto'
import { byId, isBuyable, priceTotals, totals } from './data.js'
import { findAccount } from '../../lib/accounts.js'

const productState = p => ({id:p.id,price:p.price,kind:p.kind,platform:p.platform,edition:p.edition,format:p.format,title:p.title,release:p.release,purchasable:p.purchasable,available:p.available,physical:p.physical,stock:p.stock,entitlement:p.entitlement,type:p.productType,requires:p.requires,bundle:p.bundle,family:p.family,quantity:p.quantity,repeatable:p.repeatable,platforms:p.platforms,gamesIncluded:p.gamesIncluded,addonsIncluded:p.addonsIncluded,preorder:p.ribbon==='PRE-ORDER'})
const owner = req => req.store.user?.id || null
const paymentChoices = req => req.store.user ? findAccount(req.storeSlug,req.store.user.email)?.payment_methods || [] : []
export const directFingerprint = (req,p,payment=null,billing=null) => JSON.stringify({owner:owner(req),product:productState(p),totals:priceTotals(p.price),payment,billing,...(!payment?{paymentChoices:paymentChoices(req)}:{})})
export const cartValid = req => req.store.cart.length>0 && req.store.cart.every(l=>isBuyable(byId(l.pid)) && !owns(req,byId(l.pid))) && new Set(req.store.cart.map(l=>l.pid)).size===req.store.cart.length
export const cartFingerprint = req => JSON.stringify({owner:owner(req),products:req.store.cart.map(l=>byId(l.pid)).filter(Boolean).map(productState),totals:totals(req.store),paymentChoices:paymentChoices(req)})
export function review(req,key,fingerprint) {
  const value={token:randomBytes(18).toString('hex'),fingerprint}
  req.store.checkout[key]=value
  return value.token
}
// Legacy tokenless HTTP callers remain supported only while the last rendered review
// still matches trusted state. Browser forms always include their specific review token.
export function matchesReview(req,key,fingerprint,token) {
  const previous=req.store.checkout[key]
  if(token!==undefined && (!previous || token!==previous.token))return false
  return !previous || previous.fingerprint===fingerprint
}
export const safeValues = body => Object.fromEntries(Object.entries(body||{}).filter(([k,v])=>typeof v==='string'&&!['cardNumber','cvv','password','passwd'].includes(k)).map(([k,v])=>[k,v.slice(0,1000)]))
export const toOrderItem = p => p.kind==='game' ? {platform:p.platform,edition:p.edition,format:p.format,qty:1,unit_price:p.price,title:p.title,sku:p.id} : {kind:'other',title:p.title,qty:1,unit_price:p.price,sku:p.id}
export function entitlements(items) {
  return items.filter(item=>!byId(item.sku)?.physical).map(item=>{
    const p=byId(item.sku)
    return {sku:p.id,family:p.family,type:p.entitlement,product_type:p.productType,requires:p.requires||null,quantity:p.quantity||1,repeatable:Boolean(p.repeatable),included_skus:[...(p.bundle||[])],included_games:[...(p.gamesIncluded||[])],included_addons:[...(p.addonsIncluded||[])],platforms:[...p.platforms],release:p.release,preorder:p.ribbon==='PRE-ORDER'}
  })
}
