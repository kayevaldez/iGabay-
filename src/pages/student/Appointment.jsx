import { Navigate, useNavigate } from 'react-router-dom'
import Shell from '../../components/Shell'
import { Field, Notice, Stepper } from '../../components/ui'
import { useApp } from '../../state'
import { fmtDate, fmtTime, fullName } from '../../utils'

// FR-12 (appointment form with details), FR-13 (Select date button), FR-17 (review first)
export default function Appointment() {
  const { db, user, byId, slotById, setRemarks } = useApp()
  const navigate = useNavigate()
  if (!db.draft.answers) return <Navigate to="/student/assessment" replace /> // assessment comes first
  const counselor = db.users.find((u) => u.role === 'counselor' && u.status === 'active')
  const slot = db.draft.slotId ? slotById(db.draft.slotId) : null
  return (
    <Shell role="student" eyebrow="STUDENT / GUIDANCE REQUEST" title="Appointment details" subtitle="Fill in the appointment form, then choose a date and time.">
      <Stepper steps={['Well-being assessment', 'Appointment details', 'Review & submit']} current={2} />
      <div className="two-col">
        <form className="card" onSubmit={(e) => { e.preventDefault(); navigate('/student/review') }}>
          <Field label="Counselor" id="c"><input id="c" value={fullName(counselor || byId(5))} readOnly /></Field>
          <Field label="Your Gmail for the confirmation" id="g"><input id="g" value={user.email} readOnly /></Field>
          <Field label="Notes for the counselor (optional)" id="r" hint="Please don’t share sensitive details here."><textarea id="r" rows="3" value={db.draft.remarks} onChange={(e) => setRemarks(e.target.value)} /></Field>
          <Field label="Date and time" id="d">
            <div className="row"><button type="button" className="btn btn-ghost" onClick={() => navigate('/student/select-date')}>Select date</button><span id="d">{slot ? `${fmtDate(slot.date)}, ${fmtTime(slot.start)}` : 'No date selected yet'}</span></div>
          </Field>
          {!slot && <Notice kind="warn" title="Select a date and time first">Press Select date to open the calendar.</Notice>}
          <div className="row"><button className="btn" type="submit" disabled={!slot}>Review appointment</button><button type="button" className="btn btn-ghost" onClick={() => navigate('/student/assessment')}>Back</button></div>
        </form>
        <aside className="card tint"><h2>Appointment details</h2><p>The same details are shown after you submit, and sent to your Gmail.</p><p><strong>Counselor:</strong> {fullName(counselor)}</p><p><strong>Date:</strong> {slot ? fmtDate(slot.date) : '—'}</p><p><strong>Time:</strong> {slot ? fmtTime(slot.start) : '—'}</p></aside>
      </div>
    </Shell>
  )
}
