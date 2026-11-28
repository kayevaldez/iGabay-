import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../state'
import Shell from '../../components/Shell'
import { Chips, EmptyState, Loading, StatusBadge } from '../../components/ui'
import { useLoading } from '../../useLoading'
import { fmtStamp, fullName } from '../../utils'

const FILTERS = [['all', 'All'], ['booked', 'Booked'], ['rescheduled', 'Rescheduled'], ['completed', 'Completed'], ['cancelled', 'Cancelled']]

// Guidance Counselor: own appointments only (Figma C01, C06)
export default function CounselorAppointments() {
  const { db, user, byId, slotById } = useApp()
  const loading = useLoading()
  const [filter, setFilter] = useState('all')
  const mine = db.appointments.filter((a) => a.counselorId === user.id).sort((a, b) => a.slotId.localeCompare(b.slotId))
  const list = mine.filter((a) => filter === 'all' || a.status === filter)
  return (
    <Shell role="counselor">
      <div className="page">
        <div><p className="eyebrow">My appointments</p><h1>Your counseling schedule</h1><p className="lead">Only your own appointments are shown.</p></div>
        {mine.length > 0 && <Chips items={FILTERS} value={filter} onChange={setFilter} />}
        {loading ? <Loading label="Loading your schedule…" /> : list.length === 0 ? (
          <EmptyState title="No appointments yet">Appointments booked by students will show here.</EmptyState>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Student</th><th>Date & time</th><th>Status</th><th><span className="sr">Action</span></th></tr></thead>
              <tbody>{list.map((a) => { const s = slotById(a.slotId); return (
                <tr key={a.id}><td>{fullName(byId(a.studentId))}</td><td>{fmtStamp(s.date, s.start)}</td><td><StatusBadge status={a.status} /></td><td><Link className="link" to={`/counselor/appointments/${a.id}`}>View details →</Link></td></tr>
              ) })}</tbody>
            </table>
          </div>
        )}
      </div>
    </Shell>
  )
}
