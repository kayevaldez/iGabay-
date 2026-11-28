import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../../state'
import Shell from '../../components/Shell'
import { Field, Notice, StatusBadge } from '../../components/ui'
import { fmtStamp, fullName } from '../../utils'

const STATUSES = [['booked', 'Booked'], ['rescheduled', 'Rescheduled'], ['completed', 'Completed'], ['cancelled', 'Cancelled'], ['no-show', 'No-Show']]

// Appointment details and Update status (Figma A02)
export default function AppointmentDetails() {
  const { id } = useParams()
  const { db, byId, slotById, updateAppointmentStatus } = useApp()
  const go = useNavigate()
  const a = db.appointments.find((x) => x.id === Number(id))
  const [status, setStatus] = useState(a ? a.status : 'booked')
  const [note, setNote] = useState(a?.note || '')
  const [saved, setSaved] = useState(false)
  if (!a) return <Navigate to="/associate" replace />
  const student = byId(a.studentId), slot = slotById(a.slotId)
  const open = a.status === 'booked' || a.status === 'rescheduled'
  return (
    <Shell role="associate">
      <div className="page">
        <div><p className="eyebrow">Appointments & requests</p><h1>Appointment details</h1></div>
        {saved && <Notice kind="ok">The status is saved.</Notice>}
        <div className="grid2">
          <section className="card">
            <h2>Appointment</h2>
            <dl className="kv">
              <dt>Student</dt><dd>{fullName(student)}</dd><dt>Email</dt><dd>{student.email}</dd><dt>Contact number</dt><dd>{student.contactNumber || 'Not provided'}</dd>
              <dt>Counselor</dt><dd>{fullName(byId(a.counselorId))}</dd><dt>Date & time</dt><dd>{fmtStamp(slot.date, slot.start)}</dd><dt>Status</dt><dd><StatusBadge status={a.status} /></dd>
            </dl>
          </section>
          <section className="card stack">
            <h2 style={{ margin: 0 }}>Update status</h2>
            <Field id="status" label="Status">
              <select id="status" className="input" value={status} onChange={(e) => { setStatus(e.target.value); setSaved(false) }}>
                {a.status === 'counselor absent' && <option value="counselor absent">Counselor absent</option>}
                {STATUSES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </Field>
            <Field id="note" label="Outcome note"><textarea id="note" className="input" placeholder="[Note]" value={note} onChange={(e) => { setNote(e.target.value); setSaved(false) }} /></Field>
            <div className="row">
              <Link className="btn btn-outline" to="/associate">Back to dashboard</Link>
              {open && <button className="btn btn-outline" onClick={() => go(`/associate/appointments/${a.id}/absence`)}>Send absence email</button>}
            </div>
            <div><button className="btn" onClick={() => { updateAppointmentStatus(a.id, status, note.trim()); setSaved(true) }}>Save status</button></div>
          </section>
        </div>
      </div>
    </Shell>
  )
}
