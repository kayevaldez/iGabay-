import { Navigate, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Shell from '../../components/Shell'
import { Notice, Stepper } from '../../components/ui'
import { useApp } from '../../state'
import { fmtDate, fmtTime, fullName } from '../../utils'

// FR-17 (review before submitting), FR-18 (record the appointment)
export default function Review() {
  const { db, user, byId, slotById, submitAppointment } = useApp()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const slot = db.draft.slotId ? slotById(db.draft.slotId) : null
  if (!db.draft.answers || !slot) return <Navigate to="/student/appointment" replace />

  function submit() {
    const id = submitAppointment(user.id)
    if (id) navigate(`/student/appointments/${id}`)
    else setError('That time was just taken. Please go back and choose another.')
  }
  return (
    <Shell role="student" eyebrow="STUDENT / GUIDANCE REQUEST" title="Review & submit" subtitle="Check everything. You can go back to change it before submitting.">
      <Stepper steps={['Well-being assessment', 'Appointment details', 'Review & submit']} current={3} />
      <section className="card">
        <dl className="details">
          <dt>Counselor</dt><dd>{fullName(byId(slot.counselorId))}</dd>
          <dt>Date</dt><dd>{fmtDate(slot.date)}</dd>
          <dt>Time</dt><dd>{fmtTime(slot.start)}</dd>
          <dt>Notes</dt><dd>{db.draft.remarks || 'None'}</dd>
          <dt>Assessment</dt><dd>{db.draft.answers.length} answers submitted</dd>
          <dt>Confirmation sent to</dt><dd>{user.email}</dd>
        </dl>
        {error && <Notice kind="error" title="Could not submit">{error}</Notice>}
        <div className="row"><button className="btn" onClick={submit}>Submit appointment</button><button className="btn btn-ghost" onClick={() => navigate('/student/appointment')}>Back to change</button></div>
      </section>
    </Shell>
  )
}
