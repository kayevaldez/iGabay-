const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
export const MONTH_NAMES = MONTHS
export const parseDate = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
export const toISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export const todayISO = () => toISO(new Date())
export const addDays = (s, n) => { const d = parseDate(s); d.setDate(d.getDate() + n); return toISO(d) }
export const fmtTime = (t) => { const [h, m] = t.split(':').map(Number); return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}` }
// Figma formats: "Dec 8, 2026", "Tue, Dec 8, 2026", "Tuesday, December 8, 2026", "Tue, Dec 8, 2026 · 10:00 AM"
export const fmtShort = (s) => { const d = parseDate(s); return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${d.getFullYear()}` }
export const fmtDay = (s) => { const d = parseDate(s); return `${DAYS[d.getDay()].slice(0, 3)}, ${fmtShort(s)}` }
export const fmtLong = (s) => { const d = parseDate(s); return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}` }
export const fmtStamp = (date, time) => `${fmtShort(date)} · ${fmtTime(time)}`
export const fmtDayStamp = (date, time) => `${fmtDay(date)} · ${fmtTime(time)}`
export const fullName = (u) => (u ? `${u.firstName} ${u.lastName}`.trim() : 'Unknown user')
export const initials = (u) => (u ? `${u.firstName[0] || ''}${(u.lastName || u.firstName.split(' ')[1] || '')[0] || ''}`.toUpperCase() : '?')
export const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
// The accounts form accepts only university or Gmail addresses (Figma A04)
export const allowedEmail = (e) => /^[^\s@]+@(msunaawan\.edu\.ph|gmail\.com)$/i.test(e)
export const clock = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` }
