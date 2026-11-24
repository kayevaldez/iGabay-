import Shell from '../../components/Shell'
import { EmptyState, Loading, StatusBadge } from '../../components/ui'
import { useLoading } from '../../useLoading'
import { useApp } from '../../state'
import { fmtDate, fullName } from '../../utils'

// FR-32: contact a student who did not come to the follow-up within five days
export default function FollowUps() {
  const { db, user, byId, markFollowUp } = useApp()
  const loading = useLoading()
  return (
    <Shell role="associate" eyebrow="ASSOCIATE / FOLLOW-UP" title="Follow-up contacts" subtitle="Students who did not come to their follow-up session.">
      {loading ? <Loading /> : db.followUps.length === 0 ? <EmptyState title="No follow-ups yet" /> : (
        <div className="table-wrap"><table>
          <thead><tr><th>Student</th><th>Follow-up date</th><th>Status</th><th>Gmail and contact number</th><th>Contacted</th></tr></thead>
          <tbody>{db.followUps.map((f) => { const s = byId(f.studentId); const missed = f.status === 'missed'; return (
            <tr key={f.id}><td>{fullName(s)}</td><td>{fmtDate(f.followUpDate)}</td><td><StatusBadge status={f.status} /></td>
              <td>{missed ? <>{s.email}<br />{s.contactNumber}</> : <span className="muted">Shown only for missed follow-ups</span>}</td>
              <td>{f.contactedVia ? `Via ${f.contactedVia} on ${f.contactedAt}` : missed ? (<><button className="link-btn" onClick={() => markFollowUp(f.id, 'missed', 'gmail', user.id)}>Mark: contacted by Gmail</button><br /><button className="link-btn" onClick={() => markFollowUp(f.id, 'missed', 'contact number', user.id)}>Mark: contacted by phone</button></>) : (f.status === 'pending' ? <><button className="link-btn" onClick={() => markFollowUp(f.id, 'attended')}>Mark attended</button>{' · '}<button className="link-btn" onClick={() => markFollowUp(f.id, 'missed')}>Mark missed</button></> : '—')}</td></tr>) })}</tbody>
        </table></div>
      )}
    </Shell>
  )
}
