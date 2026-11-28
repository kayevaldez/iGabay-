import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../../state'
import Shell from '../../components/Shell'
import { Field } from '../../components/ui'
import { fmtDayStamp, fullName } from '../../utils'

// Send absence email (Figma R01) and Email sent (A08)
export default function AbsenceEmail({ sent }) {
  const { id } = useParams()
  const { db, byId, slotById, sendAbsenceEmail } = useApp()
  const go = useNavigate()
  const [message, setMessage] = useState('')
  const [reason, setReason] = useState('')
  const [errors, setErrors] = useState({})
  const a = db.appointments.find((x) => x.id === Number(id))
  if (!a) return <Navigate to="/associate" replace />
  const student = byId(a.studentId), slot = slotById(a.slotId)

  if (sent) {
    const mail = [...db.emails].reverse().find((m) => m.appointmentId === a.id && m.type === 'counselor absence')
    return (
      <Shell role="associate">
        <div className="page">
          <div><p className="eyebrow">Appointments & requests</p><h1>Email sent</h1></div>
          <div className="notice notice-ok" role="status">The absence email was sent to {student.email} with the Cancel and Rebook buttons.</div>
          <div className="row"><Link className="btn" to="/associate">Back to dashboard</Link>{mail && <Link className="btn btn-outline" to={`/email/${mail.id}`}>View email</Link>}</div>
        </div>
      </Shell>
    )
  }
  if (a.status !== 'booked' && a.status !== 'rescheduled') return <Navigate to={`/associate/appointments/${a.id}`} replace />

  const send = (e) => {
    e.preventDefault()
    const next = {}
    if (!message.trim()) next.message = 'Enter a message to the student.'
    if (!reason.trim()) next.reason = 'Enter the reason the counselor cannot attend.'
    setErrors(next)
    if (Object.keys(next).length) return
    sendAbsenceEmail(a.id, message.trim(), reason.trim())
    go(`/associate/appointments/${a.id}/sent`)
  }
  return (
    <Shell role="associate">
      <div className="page">
        <div><p className="eyebrow">Appointments & requests</p><h1>Send absence email</h1></div>
        <form className="card stack" style={{ maxWidth: 760 }} onSubmit={send} noValidate>
          <dl className="kv" style={{ margin: 0 }}>
            <dt>Student</dt><dd>{fullName(student)} · {student.email}</dd>
            <dt>Appointment</dt><dd>{fmtDayStamp(slot.date, slot.start)}</dd>
            <dt>Counselor</dt><dd>{fullName(byId(a.counselorId))}</dd>
          </dl>
          <Field id="msg" label="Message" error={errors.message}><textarea id="msg" className="input" placeholder="[Message to the student]" value={message} onChange={(e) => setMessage(e.target.value)} /></Field>
          <Field id="why" label="Reason" error={errors.reason}><textarea id="why" className="input" placeholder="[Reason the counselor cannot attend]" value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
          <p className="help">The email will include two buttons: Cancel appointment and Rebook appointment.</p>
          <div className="row"><Link className="btn btn-outline" to="/associate">Back to dashboard</Link><button className="btn" type="submit">Send email</button></div>
        </form>
      </div>
    </Shell>
  )
}
