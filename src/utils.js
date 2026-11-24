const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
export const MONTH_NAMES = MONTHS
export const parseDate = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
export const toISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export const todayISO = () => toISO(new Date())
export const addDays = (s, n) => { const d = parseDate(s); d.setDate(d.getDate() + n); return toISO(d) }
export const fmtDate = (s) => { const d = parseDate(s); return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}` }
export const fmtShort = (s) => { const d = parseDate(s); return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}` }
export const fmtTime = (t) => { const [h, m] = t.split(':').map(Number); return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}` }
export const fullName = (u) => (u ? `${u.firstName} ${u.lastName}` : 'Unknown user')
export const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
export const clock = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` }
