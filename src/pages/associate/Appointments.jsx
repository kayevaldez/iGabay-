import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../state'
import Shell from '../../components/Shell'
import { Chips, EmptyState, Loading, StatusBadge } from '../../components/ui'
import { useLoading } from '../../useLoading'
import { fmtStamp, fullName } from '../../utils'

const FILTERS = [['all', 'All'], ['booked', 'Booked'], ['rescheduled', 'Rescheduled'], ['completed', 'Completed'], ['cancelled', 'Cancelled'], ['no-show', 'No-Show']]

// Appointments & requests (Figma A01)
export default function Appointments() {
  const { db, byId, slotById } = useApp()
  const loading = useLoading()
  const [filter, setFilter] = useState('all')
  const list = [...db.appointments].filter((a) => filter === 'all' || a.status === filter).sort((a, b) => b.slotId.localeCompare(a.slotId))
  return (
    <Shell role="associate">
      <div className="page">
        <div><p className="eyebrow">Appointments & requests</p><h1>All appointments and counseling requests</h1></div>
        <Chips items={FILTERS} value={filter} onChange={setFilter} />
        {loading ? <Loading label="Loading appointments…" /> : list.length === 0 ? (
          <EmptyState title="Nothing here yet">No appointments match this filter.</EmptyState>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Student</th><th>Date & time</th><th>Counselor</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>{list.map((a) => { const s = slotById(a.slotId); const open = a.status === 'booked' || a.status === 'rescheduled'; return (
                <tr key={a.id}>
                  <td>{fullName(byId(a.studentId))}</td><td>{fmtStamp(s.date, s.start)}</td><td>{fullName(byId(a.counselorId))}</td><td><StatusBadge status={a.status} /></td>
                  <td>{open && <Link className="link" to={`/associate/appointments/${a.id}/absence`}>Send absence email</Link>}<Link className="link" to={`/associate/appointments/${a.id}`}>View details →</Link></td>
                </tr>
              ) })}</tbody>
            </table>
          </div>
        )}
      </div>
    </Shell>
  )
}
