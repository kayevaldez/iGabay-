import { useApp } from '../../state'
import Shell from '../../components/Shell'
import { EmptyState, Loading } from '../../components/ui'
import { useLoading } from '../../useLoading'
import { fmtShort, fullName } from '../../utils'

// Follow-up contact (Figma): students who did not come to the follow-up after five days
export default function FollowUps() {
  const { db, byId } = useApp()
  const loading = useLoading()
  const list = db.followUps.filter((f) => f.status === 'missed')
  return (
    <Shell role="associate">
      <div className="page">
        <div><p className="eyebrow">Follow-up contact</p><h1>Students who did not come to the follow-up</h1><p className="lead">Shown after five days without a follow-up visit.</p></div>
        {loading ? <Loading label="Loading…" /> : list.length === 0 ? <EmptyState icon="phone" title="No missed follow-ups">Students who miss a follow-up will show here.</EmptyState> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Student</th><th>Session date</th><th>Counselor</th><th>Gmail</th><th>Contact number</th></tr></thead>
              <tbody>{list.map((f) => { const s = byId(f.studentId); const rec = db.caseRecords.find((c) => c.id === f.caseRecordId); const appt = db.appointments.find((a) => a.id === rec.appointmentId); return (
                <tr key={f.id}>
                  <td>{fullName(s)}</td><td>{fmtShort(f.sessionDate)}</td><td>{fullName(byId(appt.counselorId))}</td>
                  <td><a className="link" href={`mailto:${s.email}`}>{s.email}</a></td>
                  <td>{s.contactNumber ? s.contactNumber : <span className="pill-grey">Contact number unavailable</span>}</td>
                </tr>
              ) })}</tbody>
            </table>
          </div>
        )}
      </div>
    </Shell>
  )
}
