import Shell from '../../components/Shell'
import { EmptyState, Loading, Notice } from '../../components/ui'
import { useLoading } from '../../useLoading'
import { useApp } from '../../state'

// FR-31: the report page. The SRS does not list the report contents, so this page only counts
// what is in the sample data (appointments by status, slot use, and follow-ups).
const STATUSES = ['scheduled', 'completed', 'cancelled', 'counselor absent']

export default function Reports() {
  const { db } = useApp()
  const loading = useLoading()
  const total = db.appointments.length
  const by = Object.fromEntries(STATUSES.map((s) => [s, db.appointments.filter((a) => a.status === s).length]))
  const booked = db.slots.filter((s) => s.status === 'booked').length
  const open = db.slots.filter((s) => s.status === 'open').length
  const used = booked + open ? Math.round((booked / (booked + open)) * 100) : 0
  const fu = Object.fromEntries(['pending', 'attended', 'missed'].map((s) => [s, db.followUps.filter((f) => f.status === s).length]))
  const max = Math.max(1, ...Object.values(by))
  return (
    <Shell role="associate" eyebrow="ASSOCIATE / REPORTS" title="Analytics & reporting" subtitle="Counts from the sample data in this demo.">
      <Notice title="Sample data">These numbers update when you book, cancel or record outcomes in this demo.</Notice>
      {loading ? <Loading label="Preparing report…" /> : total === 0 ? <EmptyState title="No data to report yet" /> : (
        <>
          <div className="grid cols-3">
            <div className="card stat"><span>Appointments</span><strong>{total}</strong></div>
            <div className="card stat"><span>Booked share of slots</span><strong>{used}%</strong><small>{booked} booked · {open} open</small></div>
            <div className="card stat"><span>Follow-ups</span><strong>{db.followUps.length}</strong><small>{fu.pending} pending · {fu.attended} attended · {fu.missed} missed</small></div>
          </div>
          <section className="card"><h2>Appointments by status</h2>
            {STATUSES.map((s) => <div className="bar-row" key={s}><span>{s}</span><div className="bar"><div style={{ width: `${(by[s] / max) * 100}%` }} /></div><b>{by[s]}</b></div>)}
          </section>
        </>
      )}
    </Shell>
  )
}
