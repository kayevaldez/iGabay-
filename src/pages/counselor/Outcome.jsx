import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useApp } from '../../state'
import Shell from '../../components/Shell'
import { Field, Modal, Notice } from '../../components/ui'
import { addDays, fmtShort, fmtStamp, fullName } from '../../utils'

const QUESTION_LABEL = ['[Assessment question 1]', '[Assessment question 2]', '[Assessment question 3]']
const CONCERNS = ['[Concern 1]', '[Concern 2]', '[Concern 3]', '[Concern 4]', '[Concern 5]']
const noYear = (s) => fmtShort(s).replace(/, \d{4}$/, '')

// Record outcome (Figma C02, C04, C05) and Outcome saved (C03). A follow-up can be set within five days after the session.
export default function Outcome() {
  const { id } = useParams()
  const { db, user, byId, slotById, recordOutcome } = useApp()
  const a = db.appointments.find((x) => x.id === Number(id) && x.counselorId === user.id)
  const [status, setStatus] = useState('completed')
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('09:00')
  const [errors, setErrors] = useState({})
  const [showAnswers, setShowAnswers] = useState(false)
  if (!a) return <Navigate to="/counselor" replace />

  const student = byId(a.studentId)
  const slot = slotById(a.slotId)
  const record = db.caseRecords.find((c) => c.appointmentId === a.id)
  const min = addDays(slot.date, 1), max = addDays(slot.date, 5)
  const assess = db.assessments[a.studentId]
  const crumb = `Appointment · ${fullName(student)}`

  const save = (e) => {
    e.preventDefault()
    const next = {}
    if (!notes.trim()) next.notes = 'Enter the outcome notes.'
    else if (notes.length > 2000) next.notes = 'Outcome notes can be up to 2,000 characters.'
    if (date && (date < min || date > max)) next.date = `Choose a date within five days after the session (${noYear(min)} – ${fmtShort(max)}).`
    setErrors(next)
    if (Object.keys(next).length) return
    recordOutcome(a.id, status, notes.trim(), date, date ? time : '')
  }

  if (record) {
    const when = record.followUpDate ? ` Follow-up session: ${fmtStamp(record.followUpDate, record.followUpTime || '09:00')}.` : ''
    return (
      <Shell role="counselor">
        <div className="page">
          <div><p className="eyebrow">{crumb}</p><h1>Outcome saved</h1></div>
          <Notice kind="ok">The outcome is saved in the case record.{when}</Notice>
          <div><Link className="btn" to="/counselor">Back to dashboard</Link></div>
        </div>
      </Shell>
    )
  }

  return (
    <Shell role="counselor">
      <div className="page">
        <div><p className="eyebrow">{crumb}</p><h1>Record outcome</h1></div>
        <form className="grid2" onSubmit={save} noValidate>
          <section className="card">
            <h2>Appointment</h2>
            <dl className="kv">
              <dt>Date & time</dt><dd>{fmtStamp(slot.date, slot.start)}</dd>
              <dt>Email</dt><dd>{student.email}</dd>
              <dt>Contact number</dt><dd>{student.contactNumber || 'Not provided'}</dd>
              <dt>Assessment</dt><dd>{assess ? <button type="button" className="link" onClick={() => setShowAnswers(true)}>View answers</button> : 'Not submitted'}</dd>
            </dl>
          </section>
          <section className="card stack">
            <h2 style={{ margin: 0 }}>Session outcome</h2>
            <Field id="status" label="Status">
              <select id="status" className="input" value={status} onChange={(e) => setStatus(e.target.value)}><option value="completed">Completed</option><option value="no-show">No-Show</option></select>
            </Field>
            <Field id="notes" label="Outcome notes" error={errors.notes} hint={`Up to 2,000 characters`}>
              <textarea id="notes" className="input" placeholder="[Outcome notes]" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </Field>
            <Field id="fu" label="Follow-up session (optional)" error={errors.date} hint={`Only ${noYear(min)} – ${fmtShort(max)} can be chosen (within five days after the session).`}>
              <div className="row" style={{ flexWrap: 'nowrap' }}>
                <input id="fu" className="input" type="date" min={min} max={max} value={date} onChange={(e) => setDate(e.target.value)} />
                <input aria-label="Follow-up time" className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} style={{ maxWidth: 140 }} />
              </div>
            </Field>
            <div className="row"><Link className="btn btn-outline" to="/counselor">Back to dashboard</Link><button className="btn" type="submit">Save outcome</button></div>
          </section>
        </form>
      </div>
      {showAnswers && assess && (
        <Modal size="small" title="Well-being assessment answers" subtitle={`${fullName(student)} · submitted with the ${fmtShort(slot.date)} booking. Not a clinical diagnosis.`} onClose={() => setShowAnswers(false)}
          footer={<button className="btn" onClick={() => setShowAnswers(false)}>Close</button>}>
          <dl className="kv" style={{ gridTemplateColumns: '1fr' }}>
            {QUESTION_LABEL.map((q, i) => <div key={q}><dt style={{ fontSize: '.68rem' }}>{q}</dt><dd>{assess.scores[i]} of 5</dd></div>)}
            <div><dt style={{ fontSize: '.68rem' }}>Main concern</dt><dd>{CONCERNS[assess.concern]}</dd></div>
          </dl>
        </Modal>
      )}
    </Shell>
  )
}
