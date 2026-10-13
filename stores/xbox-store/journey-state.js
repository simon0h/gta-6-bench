import { randomBytes } from 'node:crypto'
import { listOrders, getOrder } from '../../lib/orders.js'

export function accountState(req) {
  if (!req.store.user) return null
  req.store.xboxAccounts ||= {}
  return req.store.xboxAccounts[req.store.user.id] ||= { wishlist: [], preferences: { language: 'English', notifications: 'off' }, cases: [], subscription: null }
}
export const ownedOrders = req => req.store.user ? listOrders({store:req.storeSlug}).filter(o=>o.session_id===req.session.id && o.meta.account_id===req.store.user.id && o.customer.account_id===req.store.user.id) : []
export function ownedOrder(req,id) {
  const order=getOrder(id)
  return order && ownedOrders(req).includes(order) ? order : null
}
export const lifecycle = order => order.meta.lifecycle?.at(-1)?.status || (order.meta.preorder ? 'preordered' : order.shipping_address?'processing':'acquired')
export const statusLabel = order => ({cancelled:'Pre-order cancelled',return_requested:'Refund requested — pending review',preordered:'Pre-ordered',acquired:'License acquired',processing:'Preparing physical delivery'})[lifecycle(order)]
export function library(req) {
  return ownedOrders(req).filter(o=>lifecycle(o)!=='cancelled').flatMap(order=>(order.meta.entitlements||[]).map(entitlement=>({...entitlement,order,title:order.items.find(i=>i.sku===entitlement.sku)?.title||entitlement.sku})))
}
export function owns(req,p) {
  if (!req.store.user || p.repeatable || p.physical) return false
  const licenses = new Set(library(req).filter(e=>!e.repeatable).flatMap(e=>[e.sku,...e.included_skus]))
  if (licenses.has(p.id)) return true
  // A plain game listing can wrap the same non-sale base SKU granted by a
  // collection (Minecraft). Extra-content bundles remain separate purchases.
  return p.entitlement==='game' && Boolean(p.bundle?.length) && p.bundle.every(id=>licenses.has(id))
}
export function token(req,key,payload='') {
  req.store.journeyReviews ||= {}
  const t=randomBytes(18).toString('hex')
  req.store.journeyReviews[key]={token:t,owner:req.store.user?.id,payload:JSON.stringify(payload)}
  return t
}
export function validToken(req,key,value,payload='',consume=false) {
  const r=req.store.journeyReviews?.[key]
  const ok=Boolean(r && value===r.token && r.owner===req.store.user?.id && r.payload===JSON.stringify(payload))
  if(ok&&consume)delete req.store.journeyReviews[key]
  return ok
}
export const activeSubscription = req => {
  const s=accountState(req)?.subscription
  return s && new Date(s.expires_at).getTime()>Date.now() ? s : null
}
export function canCancel(order) {
  return !order.shipping_address && lifecycle(order)==='preordered' && order.meta.entitlements?.every(e=>e.preorder && new Date(`${e.release} 00:00:00 GMT`).getTime()-Date.now()>10*86400000)
}
export function canRefund(order) {
  return !order.shipping_address && ['acquired','preordered'].includes(lifecycle(order)) && order.totals.total>0 && Date.now()-new Date(order.created_at).getTime()<=14*86400000 && !order.meta.entitlements?.some(e=>e.type==='consumable') && !canCancel(order)
}
