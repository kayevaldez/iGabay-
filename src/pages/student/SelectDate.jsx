import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Shell from '../../components/Shell'
import Calendar from '../../components/Calendar'
import { Notice, Stepper } from '../../components/ui'
import { useApp } from '../../state'
import { fmtDate, fmtTime, fullName } from '../../utils'

// FR-13 to FR-16, and FR-24 (rebook goes straight here, without the assessment)
export default function SelectDate() {
  const { db, user, byId, slotById, pickSlot, rebook } = useApp()
  const navigate = useNavigate()
  const [message, setMessage] = useState('')
  const rebookId = db.draft.rebookId
  const appt = rebookId ? db.appointments.find((a) => a.id === rebookId && a.studentId === user.id) : null
  const counselorId = appt ? appt.counselorId : (db.users.find((u) => u.role === 'counselor' && u.status === 'active') || {}).id
  const slots = db.slots.filter((s) => s.counselorId === counselorId)
  const chosen = db.draft.slotId ? slotById(db.draft.slotId) : null

  function pick(s) {
    const res = pickSlot(s.id)
    setMessage(res.ok ? '' : res.error) // FR-15
  }
  function use() {
    if (appt) {
      const id = rebook(appt.id)
      if (id) navigate(`/student/appointments/${id}`)
      else setMessage('That time is no longer open. Please choose another.')
    } else navigate('/student/appointment')
  }

  return (
    <Shell role="student" eyebrow={appt ? 'STUDENT / REBOOK' : 'STUDENT'} title="Select an open date and time" subtitle={`Availability for ${fullName(byId(counselorId))}, based on the counselor’s schedule.`}>
      {!appt && <Stepper steps={['Well-being assessment', 'Appointment details', 'Review & submit']} current={2} />}
      {appt && <Notice title="Rebooking">You are rebooking without answering the assessment again. Choose a new date and time.</Notice>}
      <div className="two-col wide-left">
        <section className="card"><Calendar slots={slots} selectedId={db.draft.slotId} onPick={pick} />
          {message && <Notice kind="warn" title="That time is already booked">{message}</Notice>}
        </section>
        <aside className="card tint">
          <h2>Your selection</h2>
          <p><strong>Counselor:</strong> {fullName(byId(counselorId))}</p>
          <p><strong>Date:</strong> {chosen ? fmtDate(chosen.date) : 'Not selected'}</p>
          <p><strong>Time:</strong> {chosen ? fmtTime(chosen.start) : 'Not selected'}</p>
          <p><strong>Confirmation goes to:</strong> {user.email}</p>
          <div className="row"><button className="btn" disabled={!chosen} onClick={use}>Use this date &amp; time</button>
            <button className="btn btn-ghost" onClick={() => navigate(appt ? '/student/inbox' : '/student/appointment')}>{appt ? 'Back to inbox' : 'Back to form'}</button></div>
        </aside>
      </div>
    </Shell>
  )
}
