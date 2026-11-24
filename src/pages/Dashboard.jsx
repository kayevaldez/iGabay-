import { Link } from 'react-router-dom'
import Shell from '../components/Shell'
import { useApp } from '../state'
import { fmtDate, fmtTime, fullName } from '../utils'
import { EmptyState, StatusBadge, Loading } from '../components/ui'
import { useLoading } from '../useLoading'

// Short summary page for each role. Counts come from the sample data.
export default function Dashboard({ role }) {
  const { db, user, slotById, byId } = useApp()
  const loading = useLoading()
  const mine = db.appointments.filter((a) => (role === 'student' ? a.studentId === user?.id : role === 'counselor' ? a.counselorId === user?.id : true))
  const upcoming = mine.filter((a) => a.status === 'scheduled')
  const titles = { student: 'Welcome back', kaabag: 'Your peer talks', counselor: 'Your counseling day', associate: 'Guidance office overview' }
  const cards = {
    student: [['/student/support', 'Get support', 'Book an appointment or talk with a Kaabag.'], ['/student/appointments', 'My Appointments', 'See your appointment details.'], ['/student/inbox', 'Gmail inbox', 'Read the emails sent to your Gmail.']],
    kaabag: [['/kaabag/talks', 'Peer talks', 'Talk with students who were handed to you.']],
    counselor: [['/counselor/appointments', 'Appointments', 'Open your appointments and record outcomes.']],
    associate: [['/associate/accounts', 'Accounts', 'Create, edit and deactivate accounts.'], ['/associate/availability', 'Counselor availability', 'Set the open dates and times.'], ['/associate/appointments', 'Appointments', 'Oversee appointments and send absence emails.'], ['/associate/followups', 'Follow-up contacts', 'Contact students who missed a follow-up.'], ['/associate/reports', 'Analytics & reporting', 'Open the report page.']],
  }
  return (
    <Shell role={role} eyebrow={`${role.toUpperCase()} / DASHBOARD`} title={`${titles[role]}${role === 'student' ? ', ' + user?.firstName : ''}`} subtitle="Choose where to go next.">
      <div className="grid cards">
        {cards[role].map(([to, t, d]) => <Link className="card link-card" key={to} to={to}><strong>{t}</strong><span>{d}</span></Link>)}
      </div>
      {role !== 'kaabag' && (
        <section className="card">
          <h2>{role === 'associate' ? 'Appointments in the system' : 'Upcoming appointments'}</h2>
          {loading ? <Loading /> : upcoming.length === 0 ? <EmptyState title="No upcoming appointments">Booked appointments will show here.</EmptyState> : (
            <ul className="plain">
              {upcoming.map((a) => { const s = slotById(a.slotId); return <li key={a.id}>{fmtDate(s.date)}, {fmtTime(s.start)} · {role === 'student' ? fullName(byId(a.counselorId)) : fullName(byId(a.studentId))} <StatusBadge status={a.status} /></li> })}
            </ul>
          )}
        </section>
      )}
    </Shell>
  )
}
