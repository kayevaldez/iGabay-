import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Shell from '../../components/Shell'
import { EmptyState, Loading, Notice, StatusBadge } from '../../components/ui'
import { useLoading } from '../../useLoading'
import { useApp } from '../../state'
import { fmtDate, fmtTime, fullName } from '../../utils'

// Sample Gmail inbox. FR-20 (details to Gmail), FR-21 to FR-24 (absence email, Cancel and Rebook buttons)
export default function Inbox() {
  const { db, user, byId, slotById, cancelAppointment, startRebook } = useApp()
  const navigate = useNavigate()
  const loading = useLoading()
  const mine = db.emails.filter((e) => e.userId === user.id).slice().reverse()
  const [openId, setOpenId] = useState(null)
  const mail = mine.find((e) => e.id === openId) || mine[0]
  const appt = mail && db.appointments.find((a) => a.id === mail.appointmentId)
  const slot = appt && slotById(appt.slotId)

  return (
    <Shell role="student" eyebrow="STUDENT / GMAIL" title="Gmail inbox" subtitle="Sample view of the emails iGabay sends to your Gmail.">
      {loading ? <Loading label="Loading emails…" /> : mine.length === 0 ? <EmptyState title="No emails yet">Appointment details will arrive here after you book.</EmptyState> : (
        <div className="two-col wide-right">
          <ul className="card mail-list" aria-label="Emails">
            {mine.map((e) => <li key={e.id}><button className={`mail-item${mail.id === e.id ? ' active' : ''}`} onClick={() => setOpenId(e.id)}><strong>{e.subject}</strong><small>{e.sentAt} · {e.type}</small></button></li>)}
          </ul>
          <article className="card">
            <h2>{mail.subject}</h2>
            <p className="muted">From: iGabay · To: {user.email} · {mail.sentAt}</p>
            <p>{mail.body}</p>
            {appt && slot && <dl className="details"><dt>Counselor</dt><dd>{fullName(byId(appt.counselorId))}</dd><dt>Date</dt><dd>{fmtDate(slot.date)}</dd><dt>Time</dt><dd>{fmtTime(slot.start)}</dd><dt>Status</dt><dd><StatusBadge status={appt.status} /></dd></dl>}
            {mail.type === 'counselor absence' && appt && (
              appt.status === 'counselor absent' ? (
                <div className="row">
                  <button className="btn btn-ghost" onClick={() => cancelAppointment(appt.id)}>Cancel appointment</button>
                  <button className="btn" onClick={() => { startRebook(appt.id); navigate('/student/select-date') }}>Rebook appointment</button>
                </div>
              ) : <Notice title={appt.status === 'cancelled' ? 'Appointment cancelled' : 'Appointment rescheduled'}>{appt.status === 'cancelled' ? 'The appointment status now shows as cancelled.' : 'The appointment has a new date.'}</Notice>
            )}
          </article>
        </div>
      )}
    </Shell>
  )
}
