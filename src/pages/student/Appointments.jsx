import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../../state'
import Shell from '../../components/Shell'
import { EmptyState, Loading, Modal, Notice, StatusBadge } from '../../components/ui'
import { useLoading } from '../../useLoading'
import { fmtDayStamp, fmtLong, fmtShort, fmtStamp, fmtTime, fullName } from '../../utils'

// My appointments (Figma S09, S10, S11, S12) and Appointment cancelled (R04)
export default function Appointments() {
  const { id } = useParams()
  const { db, user, byId, slotById, chooseBook, chooseRebook, cancelAppointment } = useApp()
  const go = useNavigate()
  const loading = useLoading()
  const [confirm, setConfirm] = useState(null)
  const mine = db.appointments.filter((a) => a.studentId === user.id).sort((a, b) => a.slotId.localeCompare(b.slotId))
  const cancelled = id ? mine.find((a) => a.id === Number(id) && a.status === 'cancelled') : null
  if (id && !cancelled) return <Navigate to="/student/appointments" replace />

  const absent = mine.find((a) => a.status === 'counselor absent')
  const upcoming = mine.find((a) => a.status === 'booked' || a.status === 'rescheduled')
  const newBooking = () => { chooseBook(user.id); go('/student/chat') }
  const when = (a) => { const s = slotById(a.slotId); return fmtDayStamp(s.date, s.start) }
  const rows = (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Date</th><th>Time</th><th>Counselor</th><th>Status</th></tr></thead>
        <tbody>{mine.map((a) => { const s = slotById(a.slotId); return (
          <tr key={a.id}><td>{fmtShort(s.date)}</td><td>{fmtTime(s.start)}</td><td>{fullName(byId(a.counselorId))}</td><td><StatusBadge status={a.status} needsAction /></td></tr>
        ) })}</tbody>
      </table>
    </div>
  )
  const doCancel = () => { const a = confirm; setConfirm(null); cancelAppointment(a.id); go(`/student/appointments/cancelled/${a.id}`, { replace: true }) }

  return (
    <Shell role="student">
      <div className="page">
        <div className="head">
          <div>
            <p className="eyebrow">My appointments</p>
            <h1>{cancelled ? 'Appointment cancelled' : 'Your counseling appointments'}</h1>
          </div>
          {!cancelled && mine.length > 0 && <button className="btn" onClick={newBooking}>+ New counseling booking</button>}
        </div>
        {loading ? <Loading label="Loading your appointments…" /> : cancelled ? (
          <>
            <Notice kind="ok">Your appointment on {fmtStamp(slotById(cancelled.slotId).date, slotById(cancelled.slotId).start)} is cancelled.</Notice>
            {rows}
            <div><button className="btn" onClick={newBooking}>+ New counseling booking</button></div>
          </>
        ) : mine.length === 0 ? (
          <EmptyState title="No appointments yet" action={<button className="btn" onClick={newBooking}>+ New counseling booking</button>}>When you book a counseling appointment, it will show here.</EmptyState>
        ) : (
          <>
            {absent && (
              <>
                <Notice title="Your counselor is unavailable">{absent.cancelReason || 'Your counselor cannot attend on that day.'}</Notice>
                <section className="card">
                  <div className="card-head"><h2>{when(absent)}</h2><StatusBadge status={absent.status} needsAction /></div>
                  <dl className="kv"><dt>Counselor</dt><dd>{fullName(byId(absent.counselorId))}</dd></dl>
                  <p className="muted" style={{ fontSize: '.78rem' }}>Rebooking takes you straight to Select date. You do not need to answer the assessment again.</p>
                  <div className="row" style={{ marginTop: 10 }}>
                    <button className="btn" onClick={() => { chooseRebook(user.id, absent.id); go('/student/chat') }}>Rebook appointment</button>
                    <button className="btn btn-outline" onClick={() => setConfirm(absent)}>Cancel appointment</button>
                  </div>
                </section>
              </>
            )}
            {upcoming && (
              <section className="card">
                <div className="card-head"><h2>Upcoming</h2><StatusBadge status={upcoming.status} /></div>
                <dl className="kv">
                  <dt>Counselor</dt><dd>{fullName(byId(upcoming.counselorId))}</dd>
                  <dt>Date</dt><dd>{fmtLong(slotById(upcoming.slotId).date)}</dd>
                  <dt>Time</dt><dd>{fmtTime(slotById(upcoming.slotId).start)}</dd>
                </dl>
                <div style={{ marginTop: 14 }}><button className="btn btn-outline" onClick={() => setConfirm(upcoming)}>Cancel appointment</button></div>
              </section>
            )}
            {rows}
          </>
        )}
        {!cancelled && <Notice title="Not suitable for emergencies">Contact the guidance office or emergency services directly for urgent help.</Notice>}
      </div>
      {confirm && (
        <Modal size="small" title="Cancel this appointment?" subtitle={`${when(confirm)} with ${fullName(byId(confirm.counselorId))}`} onClose={() => setConfirm(null)}
          footer={<><button className="btn btn-outline" onClick={() => setConfirm(null)}>Keep appointment</button><button className="btn" onClick={doCancel}>Cancel appointment</button></>}>
          <p>The time will be opened for other students. You can make a new booking later.</p>
        </Modal>
      )}
    </Shell>
  )
}
