import { useState } from 'react'
import { useApp } from '../state'
import { MONTH_NAMES, fmtLong, fmtTime, parseDate, toISO } from '../utils'
import { Notice } from './ui'

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const FIRST = { y: 2026, m: 10 } // November 2026: first month with open times
const LAST = { y: 2026, m: 11 }

// Calendar and time list of the "Select date" window (Figma S06, R03).
// Only the counselor's open times can be chosen. A booked time shows a message.
export default function SlotPicker({ selectedId, onSelect }) {
  const { db, slotById } = useApp()
  const sel = selectedId ? slotById(selectedId) : null
  const [month, setMonth] = useState(sel ? { y: parseDate(sel.date).getFullYear(), m: parseDate(sel.date).getMonth() } : LAST)
  const [day, setDay] = useState(sel ? sel.date : null)
  const [warn, setWarn] = useState(null)

  const byDate = {}
  db.slots.forEach((s) => { (byDate[s.date] ||= []).push(s) })
  const first = new Date(month.y, month.m, 1)
  const total = new Date(month.y, month.m + 1, 0).getDate()
  const cells = [...Array(first.getDay()).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)]
  const iso = (n) => toISO(new Date(month.y, month.m, n))
  const state = (n) => {
    const list = byDate[iso(n)] || []
    if (!list.length) return 'none'
    const live = list.filter((s) => s.status !== 'unavailable')
    if (!live.length) return 'none'
    return live.some((s) => s.status === 'open') ? 'open' : 'full'
  }
  const go = (delta) => { const d = new Date(month.y, month.m + delta, 1); setMonth({ y: d.getFullYear(), m: d.getMonth() }); setDay(null); setWarn(null) }
  const atFirst = month.y === FIRST.y && month.m === FIRST.m
  const atLast = month.y === LAST.y && month.m === LAST.m
  const times = day ? (byDate[day] || []) : []

  return (
    <>
      <div className="cal-wrap">
        <div>
          <div className="cal-head">
            <button type="button" aria-label="Previous month" disabled={atFirst} onClick={() => go(-1)}>‹</button>
            <span>{MONTH_NAMES[month.m]} {month.y}</span>
            <button type="button" aria-label="Next month" disabled={atLast} onClick={() => go(1)}>›</button>
          </div>
          <div className="cal" role="grid" aria-label="Choose a date">
            {DOW.map((d) => <span key={d} className="dow">{d}</span>)}
            {cells.map((n, i) => {
              if (!n) return <span key={`e${i}`} />
              const st = state(n); const date = iso(n)
              return (
                <button key={n} type="button" className={`day${day === date ? ' sel' : st === 'full' ? ' full' : ''}`} disabled={st === 'none'}
                  aria-label={`${fmtLong(date)}${st === 'full' ? ', fully booked' : ''}`} onClick={() => { setDay(date); setWarn(null) }}>{n}</button>
              )
            })}
          </div>
        </div>
        <div>
          <div className="cal-head"><span>{day ? fmtLong(day).replace(/, \d{4}$/, '') : 'Choose a date'}</span></div>
          {day ? (
            <div className="slots">
              {times.map((s) => {
                const chosen = s.id === selectedId
                if (s.status === 'unavailable') return <button key={s.id} type="button" className="slot off" aria-disabled="true" onClick={() => setWarn(null)}>{fmtTime(s.start)}<small>Unavailable</small></button>
                if (s.status === 'booked' && !chosen) return <button key={s.id} type="button" className="slot booked" aria-disabled="true" onClick={() => setWarn(s)}>{fmtTime(s.start)}<small>Booked</small></button>
                return <button key={s.id} type="button" className={`slot${chosen ? ' sel' : ''}`} aria-pressed={chosen} onClick={() => { setWarn(null); onSelect(s.id) }}>{fmtTime(s.start)}{chosen && <small>Selected</small>}</button>
              })}
            </div>
          ) : <p className="muted">Pick a day to see the open times.</p>}
          {warn && <div style={{ marginTop: 12 }}><Notice title="That time is already booked">{fmtTime(warn.start)} is unavailable. Please choose another open time.</Notice></div>}
          <div className="legend"><span><i className="l-sel" />Selected</span><span><i />Open</span><span><i className="l-book" />Booked</span><span><i className="l-off" />Unavailable</span></div>
        </div>
      </div>
    </>
  )
}
