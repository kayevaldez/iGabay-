import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../../state'
import Shell from '../../components/Shell'
import Icon from '../../components/Icon'
import { Notice, StatusBadge } from '../../components/ui'
import { fmtDayStamp, fullName } from '../../utils'

// Student Home (Figma S02)
export default function Home() {
  const { db, user, slotById, byId, chooseBook, choosePeer } = useApp()
  const go = useNavigate()
  const mine = db.appointments.filter((a) => a.studentId === user.id)
  const upcoming = mine.filter((a) => a.status === 'booked' || a.status === 'rescheduled').sort((a, b) => a.slotId.localeCompare(b.slotId))[0]
  const absent = mine.find((a) => a.status === 'counselor absent')
  const talking = db.peerTalks.some((t) => t.studentId === user.id && t.status === 'ongoing')
  const slot = upcoming && slotById(upcoming.slotId)

  const book = () => { chooseBook(user.id); go('/student/chat') }
  const peer = () => { if (!talking) choosePeer(user.id); go('/student/chat') }

  return (
    <Shell role="student">
      <div className="page">
        <div>
          <p className="eyebrow">Home</p>
          <h1>Hi {user.firstName}, how can we help today?</h1>
          <p className="lead">Choose one. You can do this privately, any time.</p>
        </div>
        {absent && <Notice title="Your counselor is unavailable">Open <Link to="/student/appointments">My appointments</Link> to rebook or cancel.</Notice>}
        <div className="choice">
          <button type="button" onClick={book}><span><b>Book a counseling appointment</b><small className="muted">Answer a short well-being assessment, then pick a date and time.</small></span><Icon name="arrow" /></button>
          <button type="button" onClick={peer}><span><b>Have a peer talk with a Kaabag</b><small className="muted">Talk with a Student Peer Facilitator in the chat.</small></span><Icon name="arrow" /></button>
        </div>
        {upcoming && slot && (
          <section className="card" aria-label="Upcoming appointment">
            <div className="card-head"><h2>Upcoming appointment</h2><StatusBadge status={upcoming.status} /></div>
            <dl className="kv">
              <dt>Counselor</dt><dd>{fullName(byId(upcoming.counselorId))}</dd>
              <dt>Date & time</dt><dd>{fmtDayStamp(slot.date, slot.start)}</dd>
            </dl>
            <p style={{ marginTop: 14 }}><Link className="link" to="/student/appointments">View appointment details →</Link></p>
          </section>
        )}
        <Notice title="Not suitable for emergencies">Contact the guidance office or emergency services directly for urgent help.</Notice>
      </div>
    </Shell>
  )
}
