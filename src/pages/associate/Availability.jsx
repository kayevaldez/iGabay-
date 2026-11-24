import { useState } from 'react'
import Shell from '../../components/Shell'
import { Field, Notice, EmptyState } from '../../components/ui'
import { useApp } from '../../state'
import { addDays, fmtShort, fmtTime, fullName, parseDate, toISO, todayISO } from '../../utils'

// FR-29: add and change the counselor's available dates and times. The student calendar shows the change.
const TIMES = ['10:00', '11:00', '14:00']
const endOf = (t) => `${String(Number(t.slice(0, 2)) + 1).padStart(2, '0')}:00`
function mondayOf(iso) { const d = parseDate(iso); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return toISO(d) }

export default function Availability() {
  const { db, addSlot, toggleSlot } = useApp()
  const counselors = db.users.filter((u) => u.role === 'counselor')
  const [cid, setCid] = useState(counselors[0]?.id)
  const [week, setWeek] = useState(() => mondayOf(todayISO()))
  const [date, setDate] = useState('')
  const [start, setStart] = useState('10:00')
  const [end, setEnd] = useState('11:00')
  const [msg, setMsg] = useState(null)
  const days = [0, 1, 2, 3, 4].map((n) => addDays(week, n))
  const find = (d, t) => db.slots.find((s) => s.counselorId === Number(cid) && s.date === d && s.start === t)

  function add(e) {
    e.preventDefault()
    if (!date) return setMsg({ kind: 'error', text: 'Choose a date.' })
    if (date < todayISO()) return setMsg({ kind: 'error', text: 'Choose a date that is today or later.' })
    if (end <= start) return setMsg({ kind: 'error', text: 'The end time must be after the start time.' })
    const ok = addSlot(Number(cid), date, start, end)
    setMsg(ok ? { kind: 'info', text: 'Open time added. The student calendar now shows it.' } : { kind: 'warn', text: 'That time already exists for this counselor.' })
  }
  if (!counselors.length) return <Shell role="associate" title="Counselor availability"><EmptyState title="No counselor accounts">Create a counselor account first.</EmptyState></Shell>
  return (
    <Shell role="associate" eyebrow="ASSOCIATE / AVAILABILITY" title="Counselor availability" subtitle="Enter counselor schedules. Students can book only open times.">
      <div className="row">
        <label htmlFor="co">Counselor</label>
        <select id="co" value={cid} onChange={(e) => setCid(e.target.value)}>{counselors.map((c) => <option key={c.id} value={c.id}>{fullName(c)}</option>)}</select>
        <button className="btn btn-ghost" onClick={() => setWeek(addDays(week, -7))}>‹ Previous week</button>
        <strong>Week of {fmtShort(week)}</strong>
        <button className="btn btn-ghost" onClick={() => setWeek(addDays(week, 7))}>Next week ›</button>
      </div>
      <div className="table-wrap"><table className="sched">
        <thead><tr><th>Time</th>{days.map((d) => <th key={d}>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][days.indexOf(d)]} {fmtShort(d)}</th>)}</tr></thead>
        <tbody>{TIMES.map((t) => <tr key={t}><th>{fmtTime(t)}</th>{days.map((d) => {
          const s = find(d, t)
          if (!s) return <td key={d} className="cell off">Unavailable</td>
          if (s.status === 'booked') return <td key={d} className="cell booked">Booked</td>
          return <td key={d} className={`cell ${s.status}`}><button className="link-btn" onClick={() => toggleSlot(s.id)} aria-label={`${s.status === 'open' ? 'Close' : 'Open'} ${fmtShort(d)} ${fmtTime(t)}`}>{s.status === 'open' ? 'Open' : 'Unavailable'}</button></td>
        })}</tr>)}</tbody>
      </table></div>
      <small className="muted">Booked slots cannot be changed. Press Open or Unavailable to switch a slot.</small>
      <form className="card" onSubmit={add} noValidate>
        <h2>Add an open time</h2>
        {msg && <Notice kind={msg.kind} title={msg.text} />}
        <div className="grid cols-3">
          <Field id="dt" label="Date"><input id="dt" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
          <Field id="st" label="Start"><select id="st" value={start} onChange={(e) => { setStart(e.target.value); setEnd(endOf(e.target.value)) }}>{TIMES.map((t) => <option key={t} value={t}>{fmtTime(t)}</option>)}</select></Field>
          <Field id="en" label="End"><input id="en" type="time" value={end} onChange={(e) => setEnd(e.target.value)} /></Field>
        </div>
        <button className="btn" type="submit">Save availability</button>
      </form>
    </Shell>
  )
}
