import { useState } from 'react'
import { MONTH_NAMES, fmtTime, parseDate, toISO, todayISO } from '../utils'

// Calendar of one counselor's slots (FR-13 to FR-16).
// open = green and clickable, booked = dark (cannot be selected), other days are disabled.
export default function Calendar({ slots, selectedId, onPick }) {
  const today = todayISO()
  const future = slots.filter((s) => s.date >= today)
  const first = future.find((s) => s.status === 'open') || future[0] || slots[0]
  const start = first ? parseDate(first.date) : new Date()
  const [view, setView] = useState({ y: start.getFullYear(), m: start.getMonth() })
  const [day, setDay] = useState(first ? first.date : null)

  const byDate = {}
  slots.forEach((s) => { (byDate[s.date] ||= []).push(s) })
  const firstDow = new Date(view.y, view.m, 1).getDay()
  const days = new Date(view.y, view.m + 1, 0).getDate()
  const cells = [...Array(firstDow).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]
  const move = (n) => setView((v) => { const d = new Date(v.y, v.m + n, 1); return { y: d.getFullYear(), m: d.getMonth() } })
  const times = (byDate[day] || []).filter((s) => s.date >= today)

  return (
    <div className="cal-wrap">
      <div className="cal">
        <div className="cal-head">
          <strong>{MONTH_NAMES[view.m]} {view.y}</strong>
          <span>
            <button type="button" className="icon-btn" onClick={() => move(-1)} aria-label="Previous month">‹</button>
            <button type="button" className="icon-btn" onClick={() => move(1)} aria-label="Next month">›</button>
          </span>
        </div>
        <div className="cal-grid" role="grid" aria-label="Counselor availability">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <span key={d} className="dow">{d}</span>)}
          {cells.map((n, i) => {
            if (!n) return <span key={`e${i}`} className="day blank" />
            const iso = toISO(new Date(view.y, view.m, n))
            const list = byDate[iso] || []
            const hasOpen = iso >= today && list.some((s) => s.status === 'open')
            const hasSlots = iso >= today && list.some((s) => s.status !== 'unavailable')
            const cls = `day${hasOpen ? ' open' : hasSlots ? ' booked' : ' off'}${iso === day ? ' active' : ''}`
            return <button key={iso} type="button" className={cls} disabled={!hasSlots} onClick={() => setDay(iso)} aria-label={`${n} ${MONTH_NAMES[view.m]}${hasOpen ? ', open times' : hasSlots ? ', fully booked' : ', unavailable'}`}>{n}</button>
          })}
        </div>
        <div className="legend"><span className="dot open" />Open <span className="dot booked" />Booked <span className="dot off" />Unavailable</div>
      </div>
      <div className="times">
        <strong>Available times</strong>
        {!day || times.length === 0 ? <p className="muted">Choose a green date to see its times.</p> : times.map((s) => (
          <button key={s.id} type="button"
            className={`time ${s.status}${selectedId === s.id ? ' chosen' : ''}`}
            aria-disabled={s.status !== 'open'}
            onClick={() => onPick(s)}>
            {fmtTime(s.start)}{s.status === 'booked' ? ' · Booked' : s.status === 'unavailable' ? ' · Unavailable' : ''}
          </button>
        ))}
        <small className="muted">Dark slots are booked and cannot be selected.</small>
      </div>
    </div>
  )
}
