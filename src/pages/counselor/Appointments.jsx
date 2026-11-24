import { useState } from 'react'
import Shell from '../../components/Shell'
import { EmptyState, Field, Loading, Notice, StatusBadge } from '../../components/ui'
import { useLoading } from '../../useLoading'
import { useApp } from '../../state'
import { addDays, fmtDate, fmtTime, fullName, todayISO } from '../../utils'

// FR-25 (own appointments only), FR-26 (record outcome), FR-27 (follow-up within five days)
export default function Appointments() {
  const { db, user, byId, slotById, recordOutcome } = useApp()
  const loading = useLoading()
  const mine = db.appointments.filter((a) => a.counselorId === user.id)
  const [openId, setOpenId] = useState(null)
  const [notes, setNotes] = useState('')
  const [need, setNeed] = useState(false)
  const [fdate, setFdate] = useState('')
  const [errors, setErrors] = useState({})
  const appt = mine.find((a) => a.id === openId)
  const slot = appt && slotById(appt.slotId)
  const record = appt && db.caseRecords.find((c) => c.appointmentId === appt.id)
  const follow = record && db.followUps.find((f) => f.caseRecordId === record.id)

  function open(id) { setOpenId(id); setNotes(''); setNeed(false); setFdate(''); setErrors({}) }
  function save(e) {
    e.preventDefault()
    const err = {}
    if (!notes.trim()) err.notes = 'Enter the outcome of the session.'
    if (need) {
      if (!fdate) err.fdate = 'Choose the follow-up date.'
      else if (fdate < slot.date || fdate > addDays(slot.date, 5)) err.fdate = `The follow-up must be within five days after the session (${fmtDate(slot.date)} to ${fmtDate(addDays(slot.date, 5))}).`
    }
    setErrors(err)
    if (Object.keys(err).length) return
    recordOutcome(appt.id, notes.trim(), need, need ? fdate : null)
  }

  return (
    <Shell role="counselor" eyebrow="COUNSELOR / APPOINTMENTS" title="Manage appointments" subtitle="You see only your own appointments.">
      {loading ? <Loading /> : mine.length === 0 ? <EmptyState title="No appointments yet">Booked appointments will show here.</EmptyState> : (
        <div className="two-col wide-left">
          <div className="table-wrap"><table>
            <thead><tr><th>Student</th><th>Date &amp; time</th><th>Status</th><th><span className="sr">Open</span></th></tr></thead>
            <tbody>{mine.map((a) => { const s = slotById(a.slotId); return <tr key={a.id} className={openId === a.id ? 'active' : ''}><td>{fullName(byId(a.studentId))}</td><td>{fmtDate(s.date)}, {fmtTime(s.start)}</td><td><StatusBadge status={a.status} /></td><td><button className="link-btn" onClick={() => open(a.id)}>Open</button></td></tr> })}</tbody>
          </table></div>
          <aside className="card">
            {!appt ? <EmptyState title="Select an appointment">Open one to see its details.</EmptyState> : (
              <>
                <h2>Selected appointment</h2>
                <dl className="details"><dt>Student</dt><dd>{fullName(byId(appt.studentId))}</dd><dt>Date</dt><dd>{fmtDate(slot.date)}</dd><dt>Time</dt><dd>{fmtTime(slot.start)}</dd><dt>Status</dt><dd><StatusBadge status={appt.status} /></dd><dt>Notes</dt><dd>{appt.remarks || 'None'}</dd></dl>
                {record ? (
                  <Notice title="Session outcome saved">{record.outcomeNotes}{follow ? ` Follow-up: ${fmtDate(follow.followUpDate)} (${follow.status}).` : ''}</Notice>
                ) : appt.status === 'scheduled' ? (
                  <form onSubmit={save} noValidate>
                    <h3>Record session outcome</h3>
                    <Field id="n" label="Outcome notes" error={errors.notes}><textarea id="n" rows="3" value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
                    <label className="check"><input type="checkbox" checked={need} onChange={(e) => setNeed(e.target.checked)} /> A follow-up session is needed</label>
                    {need && <Field id="f" label="Follow-up date (within 5 days)" error={errors.fdate}><input id="f" type="date" min={slot.date} max={addDays(slot.date, 5)} value={fdate} onChange={(e) => setFdate(e.target.value)} /></Field>}
                    <button className="btn" type="submit">Save outcome</button>
                    {slot.date > todayISO() && <small className="muted">Sample note: this session has not happened yet. The demo still lets you save an outcome.</small>}
                  </form>
                ) : <p className="muted">No outcome can be recorded for a {appt.status} appointment.</p>}
              </>
            )}
          </aside>
        </div>
      )}
    </Shell>
  )
}
