export const fmt = (d) => d.toISOString().slice(0, 10)
export const thisMonthRange = () => {
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth(), 1)
  const to = now
  return { from: fmt(from), to: fmt(to) }
}
export const lastNDays = (n = 7) => {
  const to = new Date()
  const from = new Date()
  from.setDate(to.getDate() - (n - 1))
  return { from: fmt(from), to: fmt(to) }
}
