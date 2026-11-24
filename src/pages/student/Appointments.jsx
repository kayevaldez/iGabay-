import { Link, useParams } from 'react-router-dom'
import Shell from '../../components/Shell'
import { EmptyState, Loading, Notice, StatusBadge } from '../../components/ui'
import { useLoading } from '../../useLoading'
import { useApp } from '../../state'
import { fmtDate, fmtTime, fullName } from '../../utils'

// FR-19: appointment details and a note that the same details go to the student's Gmail.
// Students see only their own appointments (NFR-09).
export default function Appointments() {
  const { id } = useParams()
  const { db, user, byId, slotById } = useApp()
  const loading = useLoading()
  const mine = db.appointments.filter((a) => a.studentId === user.id)
  const appt = id ? mine.find((a) => a.id === Number(id)) : null

  if (id) {
    const slot = appt && slotById(appt.slotId)
    return (
      <Shell role="student" eyebrow="STUDENT / MY APPOINTMENTS" title={appt ? 'Your appointment' : 'Appointment not found'}>
        {!appt ? <EmptyState title="We could not find this appointment">It may not belong to your account. <Link to="/student/appointments">Back to my appointments</Link></EmptyState> : (
          <>
            {appt.status === 'scheduled' && <Notice title="Your appointment is confirmed">The same details have been sent to your Gmail ({user.email}).</Notice>}
            {appt.status === 'cancelled' && <Notice kind="warn" title="This appointment was cancelled" />}
            {appt.status === 'counselor absent' && <Notice kind="warn" title="Your counselor is unavailable">Check your Gmail inbox to cancel or rebook.</Notice>}
            <div className="two-col">
              <section className="card">
                <h2>Appointment details</h2>
                <dl className="details">
                  <dt>Status</dt><dd><StatusBadge status={appt.status} /></dd>
                  <dt>Counselor</dt><dd>{fullName(byId(appt.counselorId))}</dd>
                  <dt>Date</dt><dd>{fmtDate(slot.date)}</dd>
                  <dt>Time</dt><dd>{fmtTime(slot.start)} – {fmtTime(slot.end)}</dd>
                  <dt>Notes</dt><dd>{appt.remarks || 'None'}</dd>
                </dl>
              </section>
              <aside className="card tint"><h2>Your next step</h2><p>Attend your counseling session. The session itself takes place outside iGabay.</p><Link className="btn btn-ghost" to="/student/appointments">My Appointments</Link></aside>
            </div>
          </>
        )}
      </Shell>
    )
  }
  return (
    <Shell role="student" eyebrow="STUDENT / MY APPOINTMENTS" title="My Appointments" subtitle="Only you can see these.">
      {loading ? <Loading /> : mine.length === 0 ? (
        <EmptyState title="You have no appointments yet">Go to <Link to="/student/support">Get support</Link> to book one.</EmptyState>
      ) : (
        <div className="table-wrap"><table>
          <thead><tr><th>Date</th><th>Time</th><th>Counselor</th><th>Status</th><th><span className="sr">Open</span></th></tr></thead>
          <tbody>{mine.map((a) => { const s = slotById(a.slotId); return (
            <tr key={a.id}><td>{fmtDate(s.date)}</td><td>{fmtTime(s.start)}</td><td>{fullName(byId(a.counselorId))}</td><td><StatusBadge status={a.status} /></td><td><Link to={`/student/appointments/${a.id}`}>View</Link></td></tr>) })}</tbody>
        </table></div>
      )}
    </Shell>
  )
}
