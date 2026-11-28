import { useState } from 'react'
import { useApp } from '../../state'
import Shell from '../../components/Shell'
import { Field, Modal, Notice } from '../../components/ui'
import { TIMES } from '../../data/mock'
import { addDays, fmtShort, fmtTime, fullName, parseDate } from '../../utils'

const noYear = (s) => fmtShort(s).replace(/, \d{4}$/, '')
const WEEKS = Array.from({ length: 9 }, (_, i) => addDays('2026-11-02', i * 7)) // Mondays from Nov 2 to Dec 28
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

// Counselor availability (Figma A05 and Add time slot)
export default function Availability() {
  const { db, addSlot, applySlotChanges } = useApp()
  const counselors = db.users.filter((u) => u.role === 'counselor' && u.status === 'active')
  const [week, setWeek] = useState('2026-12-07')
  const [pending, setPending] = useState({})
  const [adding, setAdding] = useState(false)
  const [add, setAdd] = useState({ date: '2026-12-10', time: '16:00' })
  const [msg, setMsg] = useState(null)
  const [addErr, setAddErr] = useState('')
  const days = DAYS.map((_, i) => addDays(week, i))
  const find = (date, start) => db.slots.find((s) => s.date === date && s.start === start)
  const statusOf = (s) => pending[s.id] || s.status
  const toggle = (s) => { if (s.status === 'booked') return; setMsg(null); setPending({ ...pending, [s.id]: statusOf(s) === 'open' ? 'unavailable' : 'open' }) }
  const save = () => {
    const changes = Object.fromEntries(Object.entries(pending).filter(([id, st]) => db.slots.find((s) => s.id === id).status !== st))
    applySlotChanges(changes); setPending({}); setMsg('The changes are saved. Students see only the open slots.')
  }
  const doAdd = (e) => {
    e.preventDefault()
    const d = parseDate(add.date)
    if (!add.date) { setAddErr('Choose a date.'); return }
    if (d.getDay() === 0 || d.getDay() === 6) { setAddErr('Choose a day from Monday to Friday.'); return }
    if (!addSlot(add.date, add.time)) { setAddErr('That time slot already exists.'); return }
    setAdding(false); setAddErr(''); setMsg(`The time slot on ${fmtShort(add.date)} at ${fmtTime(add.time)} is added.`)
  }
  const dirty = Object.keys(pending).length > 0
  return (
    <Shell role="associate">
      <div className="page">
        <div className="head">
          <div><p className="eyebrow">Counselor availability</p><h1>Set open dates and times</h1><p className="lead">Students see only these open slots in the calendar.</p></div>
          <div className="row"><button className="btn btn-outline" onClick={() => { setAddErr(''); setAdding(true) }}>+ Add time slot</button><button className="btn" onClick={save} disabled={!dirty}>Save changes</button></div>
        </div>
        {msg && <Notice kind="ok">{msg}</Notice>}
        <div className="grid2" style={{ maxWidth: 560 }}>
          <Field id="counselor" label="Counselor"><select id="counselor" className="input">{counselors.map((c) => <option key={c.id}>{fullName(c)}</option>)}</select></Field>
          <Field id="week" label="Week"><select id="week" className="input" value={week} onChange={(e) => { setWeek(e.target.value); setPending({}) }}>{WEEKS.map((w) => <option key={w} value={w}>{noYear(w)} – {fmtShort(addDays(w, 4))}</option>)}</select></Field>
        </div>
        <div className="week">
          {days.map((date, i) => (
            <div className="col" key={date}>
              <h3>{DAYS[i]} {noYear(date)}</h3>
              {TIMES.map((t) => {
                const s = find(date, t)
                if (!s) return <span key={t} className="slot off" aria-hidden="true">{fmtTime(t)}</span>
                const st = statusOf(s)
                return <button key={t} type="button" className={`slot${st === 'booked' ? ' booked' : st === 'unavailable' ? ' off' : ''}`} aria-pressed={st === 'open'} aria-disabled={st === 'booked'} onClick={() => toggle(s)}>{fmtTime(t)}</button>
              })}
            </div>
          ))}
        </div>
        <div className="legend"><span><i />Open</span><span><i className="l-book" />Booked</span><span><i className="l-off" />Unavailable</span><span>Tap an open or unavailable time to change it, then press Save changes.</span></div>
      </div>
      {adding && (
        <Modal size="small" title="Add time slot" subtitle="The calendar will show this slot to students." onClose={() => setAdding(false)}
          footer={<><button type="button" className="btn btn-outline" onClick={() => setAdding(false)}>Cancel</button><button type="submit" form="add-slot" className="btn">Add time slot</button></>}>
          <form id="add-slot" className="stack" onSubmit={doAdd} noValidate>
            <Field id="ac" label="Counselor"><select id="ac" className="input">{counselors.map((c) => <option key={c.id}>{fullName(c)}</option>)}</select></Field>
            <div className="grid2">
              <Field id="ad" label="Date" error={addErr}><input id="ad" className="input" type="date" min="2026-11-02" max="2026-12-31" value={add.date} onChange={(e) => setAdd({ ...add, date: e.target.value })} /></Field>
              <Field id="at" label="Time"><select id="at" className="input" value={add.time} onChange={(e) => setAdd({ ...add, time: e.target.value })}>{TIMES.map((t) => <option key={t} value={t}>{fmtTime(t)}</option>)}</select></Field>
            </div>
          </form>
        </Modal>
      )}
    </Shell>
  )
}
