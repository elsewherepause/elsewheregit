/** Groups items into rows whose aspect ratios add up to about `target`, so every row
 *  can share one height and fill the width exactly. The last row gets a spacer so a
 *  lone photo isn’t blown up to full width. */
export function toRows<T>(items: T[], ar: (t: T) => number, target: number): { items: T[]; spacer: number }[] {
  const rows: { items: T[]; spacer: number }[] = []
  let cur: T[] = []
  let sum = 0
  for (const it of items) {
    const a = Math.min(Math.max(ar(it), 0.4), 3.5)
    // Close the row when adding this one would overshoot more than stopping short.
    if (cur.length && sum + a > target && Math.abs(sum + a - target) > Math.abs(sum - target)) {
      rows.push({ items: cur, spacer: 0 })
      cur = []
      sum = 0
    }
    cur.push(it)
    sum += a
  }
  if (cur.length) rows.push({ items: cur, spacer: Math.max(0, target - sum) * (sum < target * 0.7 ? 1 : 0) })
  return rows
}
