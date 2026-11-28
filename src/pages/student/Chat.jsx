import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BUTTON_TEXT, useApp } from '../../state'
import Shell from '../../components/Shell'
import Icon from '../../components/Icon'
import SlotPicker from '../../components/SlotPicker'
import { Modal } from '../../components/ui'
import { fmtDay, fmtDayStamp, fmtTime, fullName } from '../../utils'

const QUESTIONS = ['[Assessment question 1 — from the OGCCS form]', '[Assessment question 2 — from the OGCCS form]', '[Assessment question 3 — from the OGCCS form]']
const CONCERNS = ['[Concern 1]', '[Concern 2]', '[Concern 3]', '[Concern 4]', '[Concern 5]']
const EMERGENCY = <><b>Not suitable for emergencies</b> — Contact the guidance office or emergency services directly for urgent help.</>

// Well-being scale: one 1 to 5 question (Figma S13)
function Scale({ label, value, onChange, name }) {
  return (
    <div className="q">
      <div className="q-label">{label}</div>
      <div className="scale" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" role="radio" aria-checked={value === n} name={name} className={value === n ? 'on' : ''} onClick={() => onChange(n)}>{n}</button>)}
      </div>
      <div className="ends"><span>[Lowest label]</span><span>[Highest label]</span></div>
    </div>
  )
}

// Figma S04
function AssessmentModal({ onClose, onSubmit }) {
  const [scores, setScores] = useState([0, 0, 0])
  const [concern, setConcern] = useState(null)
  const [error, setError] = useState(false)
  const answered = scores.filter(Boolean).length
  const submit = () => {
    if (answered < 3 || concern === null) { setError(true); return }
    onSubmit(scores, concern)
  }
  return (
    <Modal size="wide" title="Well-being assessment" subtitle={`Step ${Math.min(answered + 1, 3)} of 3 · This is not a clinical diagnosis.`} onClose={onClose}
      footer={<button className="btn" onClick={submit}>Submit assessment</button>}>
      <div className="progress" aria-hidden="true"><i style={{ width: `${Math.max(1, answered) * 33.4}%` }} /></div>
      <div style={{ marginTop: 16 }}>
        {QUESTIONS.map((q, i) => <Scale key={q} label={q} name={`q${i}`} value={scores[i]} onChange={(n) => setScores(scores.map((x, j) => (j === i ? n : x)))} />)}
        <div className="q-label">What is your main concern?</div>
        <div className="concerns">{CONCERNS.map((c, i) => <button key={c} type="button" className={concern === i ? 'on' : ''} aria-pressed={concern === i} onClick={() => setConcern(i)}>{c}</button>)}</div>
        {error && <p className="err" role="alert" style={{ color: 'var(--amber-head)', fontSize: '.75rem' }}>Please answer all three questions and choose your main concern.</p>}
      </div>
    </Modal>
  )
}

export default function Chat() {
  const app = useApp()
  const { db, user, counselor, slotById, chatLog, chooseBook, choosePeer, submitAssessment, setStep, chooseSlot, confirmDateTime, submitAppointment, submitReplacement, cancelAppointment, sendMessage } = app
  const go = useNavigate()
  const log = chatLog(user.id)
  const draft = db.draft
  const talk = [...db.peerTalks].reverse().find((t) => t.studentId === user.id)
  const ongoing = talk && talk.status === 'ongoing'
  const [picked, setPicked] = useState(null)
  const [text, setText] = useState('')
  const [slotError, setSlotError] = useState(false)
  const endRef = useRef(null)
  const view = picked && picked.ongoing === Boolean(ongoing) ? picked.value : ongoing ? 'kaabag' : 'bot'
  const rebook = draft.rebookId ? db.appointments.find((a) => a.id === draft.rebookId) : null
  const slot = draft.slotId ? slotById(draft.slotId) : null
  const oldSlot = rebook ? slotById(rebook.slotId) : null

  const talkCount = talk ? talk.messages.length : 0
  useEffect(() => { if (endRef.current) endRef.current.scrollTop = endRef.current.scrollHeight }, [log.length, talkCount])

  const press = (key) => (key === 'book' ? chooseBook(user.id) : choosePeer(user.id))
  const last = log[log.length - 1]
  // when a pop-up was closed in the middle of a booking, show a button to continue
  const resume = !draft.step && !ongoing && last
    ? (last.kind === 'bot' && last.text.startsWith('Before we book') ? 'assessment'
      : last.kind === 'me' && (last.text === 'Rebook appointment') ? 'date'
        : last.kind === 'me' && last.text === 'Use this date & time' ? 'review' : null)
    : null
  const waiting = ongoing && talk.messages.filter((m) => m.from !== 'system').slice(-1)[0]
  const asked = ongoing && waiting && waiting.from === 'kaabag' && waiting.text === 'Do you want counseling?'

  const send = (msg) => {
    const t = (msg ?? text).trim()
    if (!t || !ongoing) return
    sendMessage(talk.id, 'student', t); setText('')
  }
  const card = (it) => {
    if (it.card === 'form') {
      const fs = it.slotId ? slotById(it.slotId) : slot
      const closed = log.some((x) => x.kind === 'card' && x.card === 'booked' && x.id > it.id)
      return (
        <div className="mini">
          <header><b>Appointment form</b><small>Review your details, then choose a date.</small></header>
          <dl>
            <dt>Student</dt><dd>{fullName(user)}</dd><dt>Email</dt><dd>{user.email}</dd><dt>Counselor</dt><dd>{fullName(counselor)}</dd>
            <dt>Date & time</dt><dd>{fs ? fmtDayStamp(fs.date, fs.start) : 'Not selected'}</dd>
          </dl>
          {!closed && <footer><button className="link" onClick={() => setStep('date')}>{fs ? 'Change date' : 'Select date'}</button></footer>}
        </div>
      )
    }
    const a = db.appointments.find((x) => x.id === it.appointmentId)
    const s = slotById(a.slotId)
    const word = it.card === 'rescheduled' ? 'rescheduled' : 'booked'
    return (
      <div className="mini">
        <header><b>Appointment {word}</b><small>Status: {word[0].toUpperCase() + word.slice(1)}</small></header>
        <dl><dt>Counselor</dt><dd>{fullName(app.byId(a.counselorId))}</dd><dt>Date</dt><dd>{fmtDay(s.date)}</dd><dt>Time</dt><dd>{fmtTime(s.start)}</dd><dt>Place</dt><dd>OGCCS office</dd></dl>
        <footer><button className="link" onClick={() => go('/student/appointments')}>View appointment details</button></footer>
      </div>
    )
  }

  const bot = (key, children, first = true) => <div className="m" key={key}>{first ? <span className="avatar sm" aria-hidden="true">iG</span> : <span style={{ width: 24, flex: 'none' }} />}<div className="col">{children}</div></div>
  const items = []
  const BOTS = ['bot', 'buttons', 'card']
  log.forEach((it, i) => {
    const first = !(i > 0 && BOTS.includes(log[i - 1].kind))
    if (it.kind === 'bot') items.push(bot(`b${it.id}`, <div className="bub">{it.text}</div>, first))
    else if (it.kind === 'me') items.push(<div className="m me" key={`m${it.id}`}><div className="col"><div className="bub me">{it.text}</div>{it.seen && <span className="seen">Seen</span>}</div></div>)
    else if (it.kind === 'buttons') items.push(bot(`o${it.id}`, <div className="opts">{it.options.map((k) => <button key={k} className="opt" disabled={it.used} onClick={() => press(k)}>{BUTTON_TEXT[k]}</button>)}</div>, first))
    else if (it.kind === 'card') items.push(bot(`c${it.id}`, card(it), first))
    else if (it.kind === 'talk') {
      const t = db.peerTalks.find((x) => x.id === it.talkId)
      t.messages.forEach((m) => {
        const key = `t${t.id}-${m.id}`
        if (m.from === 'system') items.push(<div className="sys" key={key}>{m.student}</div>)
        else if (m.from === 'kaabag') items.push(<div className="m" key={key}><span className="avatar sm brown" aria-hidden="true">K</span><div className="col"><span className="who">Kaabag</span><div className="bub kaabag">{m.text}</div></div></div>)
        else items.push(<div className="m me" key={key}><div className="col"><div className="bub me">{m.text}</div></div></div>)
      })
    }
  })
  if (resume) items.push(bot('resume', <div className="opts"><button className="opt" onClick={() => setStep(resume)}>Continue</button></div>))

  const submitRef = () => {
    if (rebook) {
      const id = submitReplacement(user.id)
      if (id === null) { setSlotError(true); setStep('date') }
    } else {
      const id = submitAppointment(user.id)
      if (id === null) { setSlotError(true); setStep('date') }
    }
  }
  const cancelInstead = () => { const id = rebook.id; cancelAppointment(id); go(`/student/appointments/cancelled/${id}`) }

  return (
    <Shell role="student" bare>
      <div className="chat">
        <aside className="chat-list" aria-label="Chats">
          <h2>Chats</h2>
          <button className={`chat-item${view === 'bot' ? ' on' : ''}`} onClick={() => setPicked({ value: 'bot', ongoing: Boolean(ongoing) })}>
            <span className="avatar">iG</span><span><b>iGabay Guide</b><small>Chatbot · button-based</small></span>
          </button>
          {talk && (
            <button className={`chat-item${view === 'kaabag' ? ' on' : ''}`} onClick={() => setPicked({ value: 'kaabag', ongoing: Boolean(ongoing) })}>
              <span className="avatar brown">K</span><span><b>Kaabag · Peer talk</b><small>Student Peer Facilitator</small></span>
            </button>
          )}
        </aside>
        <section className="chat-pane" aria-label="Conversation">
          <div className="chat-head">
            <span className={`avatar${view === 'kaabag' ? ' brown' : ''}`}>{view === 'kaabag' ? 'K' : 'iG'}</span>
            <div><b>{view === 'kaabag' ? 'Kaabag · Peer talk' : 'iGabay Guide'}</b><small className="muted">{view === 'kaabag' ? 'Student Peer Facilitator' : 'Chatbot · choose with the buttons'}</small></div>
          </div>
          <div className="emerg">{EMERGENCY}</div>
          <div className="msgs" ref={endRef} aria-live="polite">{items}</div>
          {asked && (
            <div className="quick"><button className="opt" onClick={() => send('Yes')}>Yes</button><button className="opt" onClick={() => send('No')}>No</button></div>
          )}
          <form className="composer" onSubmit={(e) => { e.preventDefault(); send() }}>
            <input aria-label="Message" placeholder={ongoing ? 'Aa' : 'Choose an option above to continue'} disabled={!ongoing} value={text} onChange={(e) => setText(e.target.value)} />
            <button className="send" type="submit" aria-label="Send" disabled={!ongoing || !text.trim()}><Icon name="send" size={16} /></button>
          </form>
        </section>
      </div>

      {draft.step === 'assessment' && <AssessmentModal onClose={() => setStep(null)} onSubmit={(s, c) => submitAssessment(user.id, s, c)} />}
      {draft.step === 'date' && (
        <Modal size="wide" title={rebook ? 'Rebook — select a new date' : 'Select date'} onClose={() => { setSlotError(false); setStep(null) }}
          subtitle={rebook ? `No need to answer the assessment again. Counselor: ${fullName(counselor)}` : `Only the counselor's open dates and times can be chosen. Counselor: ${fullName(counselor)}`}
          footer={<>
            {rebook ? <button className="btn btn-outline" onClick={cancelInstead}>Cancel instead</button> : <button className="btn btn-outline" onClick={() => { setSlotError(false); setStep(null) }}>Back to form</button>}
            <button className="btn" disabled={!slot} onClick={() => { setSlotError(false); confirmDateTime(user.id) }}>Use this date & time</button>
          </>}>
          {slotError && <div style={{ marginBottom: 12 }}><div className="notice" role="alert"><strong>That time was just taken</strong><div>Please choose another open time.</div></div></div>}
          <SlotPicker selectedId={draft.slotId} onSelect={(id) => { setSlotError(false); chooseSlot(id) }} />
        </Modal>
      )}
      {draft.step === 'review' && slot && (
        <Modal size="small" title={rebook ? 'Review your new schedule' : 'Review your appointment'} subtitle={rebook ? 'Check the new date before you submit.' : 'Check your details before you submit.'} onClose={() => setStep(null)}
          footer={<><button className="btn btn-outline" onClick={() => setStep(null)}>Back to form</button><button className="btn" onClick={submitRef}>{rebook ? 'Submit replacement' : 'Submit appointment'}</button></>}>
          {rebook ? (
            <dl className="kv"><dt>Counselor</dt><dd>{fullName(counselor)}</dd><dt>Old schedule</dt><dd><s>{fmtDayStamp(oldSlot.date, oldSlot.start)}</s></dd><dt>New schedule</dt><dd>{fmtDayStamp(slot.date, slot.start)}</dd><dt>Well-being assessment</dt><dd>Kept from your first booking</dd></dl>
          ) : (
            <dl className="kv"><dt>Student</dt><dd>{fullName(user)}</dd><dt>Email</dt><dd>{user.email}</dd><dt>Counselor</dt><dd>{fullName(counselor)}</dd><dt>Date</dt><dd>{fmtDay(slot.date)}</dd><dt>Time</dt><dd>{fmtTime(slot.start)}</dd><dt>Well-being assessment</dt><dd>Submitted</dd></dl>
          )}
        </Modal>
      )}
    </Shell>
  )
}
