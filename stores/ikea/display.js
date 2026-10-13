// Present exact eighth-inch catalog measurements naturally; retain other decimals.
export function inches(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return String(value)
  const whole = Math.trunc(number), eighth = Math.round((number - whole) * 8)
  if (number >= 0 && Math.abs(number * 8 - Math.round(number * 8)) < 0.000001) {
    return `${whole || (eighth ? '' : '0')}${['', '⅛', '¼', '⅜', '½', '⅝', '¾', '⅞'][eighth] || ''}`
  }
  return String(number)
}
