import { useState } from 'react'
import Shell from '../../components/Shell'
import { EmptyState, Field, Loading, Notice, StatusBadge } from '../../components/ui'
import { useLoading } from '../../useLoading'
import { useApp } from '../../state'
import { fmtDate, fmtTime, fullName } from '../../utils'

// FR-30 (all appointments), FR-21 (email with a message and the reason when the counselor will not attend)
export default function Appointments() {
  const { db, byId, slotById, sendAbsenceEmail } = useApp()
  const loading = useLoading()
  const [openId, setOpenId] = useState(null)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState('')
  const appt = db.appointments.find((a) => a.id === openId)

  function send(e) {
    e.preventDefault()
    if (!reason.trim()) return setError('Enter the reason for the counselor’s absence.')
    sendAbsenceEmail(appt.id, reason.trim())
    setError(''); setSent(`Email sent to ${byId(appt.studentId).email}.`); setReason('')
  }
  return (
    <Shell role="associate" eyebrow="ASSOCIATE / APPOINTMENTS" title="Appointments & counselor absence" subtitle="Oversee all appointments and counseling requests.">
      {loading ? <Loading /> : db.appointments.length === 0 ? <EmptyState title="No appointments yet" /> : (
        <div className="two-col wide-left">
          <div className="table-wrap"><table>
            <thead><tr><th>Student</th><th>Counselor</th><th>Date &amp; time</th><th>Status</th><th><span className="sr">Open</span></th></tr></thead>
            <tbody>{db.appointments.map((a) => { const s = slotById(a.slotId); return <tr key={a.id} className={openId === a.id ? 'active' : ''}><td>{fullName(byId(a.studentId))}</td><td>{fullName(byId(a.counselorId))}</td><td>{fmtDate(s.date)}, {fmtTime(s.start)}</td><td><StatusBadge status={a.status} /></td><td><button className="link-btn" onClick={() => { setOpenId(a.id); setSent(''); setError('') }}>Open</button></td></tr> })}</tbody>
          </table></div>
          <aside className="card">
            {!appt ? <EmptyState title="Select an appointment" /> : (
              <form onSubmit={send} noValidate>
                <h2>Prepare absence notification</h2>
                <p>{fullName(byId(appt.studentId))} · {fmtDate(slotById(appt.slotId).date)}</p>
                {appt.status !== 'scheduled' ? <Notice title={`This appointment is ${appt.status}`}>An absence email can only be sent for a scheduled appointment.</Notice> : (
                  <>
                    <Field id="rs" label="Reason for the counselor’s absence" error={error}><textarea id="rs" rows="3" value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
                    <p className="muted">The email has two buttons for the student: Cancel and Rebook.</p>
                    <button className="btn" type="submit">Send absence email</button>
                  </>
                )}
                {sent && <Notice title={sent} />}
              </form>
            )}
          </aside>
        </div>
      )}
    </Shell>
  )
}
