import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../state'
import { fmtDayStamp, fullName } from '../utils'
import { HOME } from '../roles'

// The sample Gmail message (Figma R02). The Rebook and Cancel buttons work for the student who gets the email.
export default function EmailView() {
  const { id } = useParams()
  const { db, user, byId, slotById, chooseRebook, cancelAppointment } = useApp()
  const go = useNavigate()
  const [note, setNote] = useState('')
  const mail = db.emails.find((m) => m.id === Number(id))
  if (!mail || (user.role === 'student' && mail.userId !== user.id) || !['student', 'associate'].includes(user.role)) return <Navigate to={HOME[user.role]} replace />
  const student = byId(mail.userId)
  const a = db.appointments.find((x) => x.id === mail.appointmentId)
  const slot = slotById(a.slotId)
  const absence = mail.type === 'counselor absence'
  const mine = user.id === student.id
  const act = (fn) => { if (!mine) { setNote('This is a preview. The student uses these buttons from the email.'); return } fn() }
  return (
    <div className="mail-bg">
      <article className="mail" aria-label="Email">
        <div className="to">Email · To: {student.email}</div>
        <div className="band"><b>iGabay</b><small>MSU NAAWAN · OGCCS</small></div>
        <div className="body">
          {absence ? <div className="notice"><strong>Your counselor is unavailable</strong><div>{mail.reason}</div></div> : <div className="notice notice-ok"><strong>{mail.subject}</strong></div>}
          <p>Hi {student.firstName}, {absence ? mail.message : 'your counseling appointment is set. The details are below.'}</p>
          <dl className="kv"><dt>Appointment</dt><dd>{fmtDayStamp(slot.date, slot.start)}</dd><dt>Counselor</dt><dd>{fullName(byId(a.counselorId))}</dd></dl>
          {absence && (
            <>
              <div className="row">
                <button className="btn" onClick={() => act(() => { chooseRebook(student.id, a.id); go('/student/chat') })}>Rebook appointment</button>
                <button className="btn btn-outline" onClick={() => act(() => { cancelAppointment(a.id); go(`/student/appointments/cancelled/${a.id}`) })}>Cancel appointment</button>
              </div>
              <small>Rebooking takes you straight to Select date. You do not need to answer the assessment again.</small>
            </>
          )}
        </div>
      </article>
      {note && <p className="help" role="status">{note}</p>}
      <Link className="btn btn-outline" to={HOME[user.role]}>Back to dashboard</Link>
    </div>
  )
}
