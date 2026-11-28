import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import * as seed from './data/mock'
import { clock, fullName, todayISO } from './utils'

const KEY = 'igabay-demo-db-v2'
const Ctx = createContext(null)
const EMPTY_DRAFT = { slotId: null, rebookId: null, step: null }

function freshDb() {
  const db = structuredClone({
    users: seed.users, profiles: seed.studentProfiles, slots: seed.slots, appointments: seed.appointments,
    assessments: seed.assessments, caseRecords: seed.caseRecords, followUps: seed.followUps,
    peerTalks: seed.peerTalks, emails: seed.emails, botLog: {}, session: null, draft: EMPTY_DRAFT,
  })
  db.slots.forEach((s) => {
    if (seed.bookedSlotIds.includes(s.id) || (seed.fullyBookedDates.includes(s.date) && s.status === 'open')) s.status = 'booked'
  })
  return db
}
function load() {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* storage not available: use sample data */ }
  return freshDb()
}
const nextId = (list) => list.reduce((m, x) => Math.max(m, x.id), 0) + 1
const TEXT = { book: 'Book an appointment', peer: 'Peer talk' }
// eslint-disable-next-line react-refresh/only-export-components
export const BUTTON_TEXT = TEXT

// The chatbot conversation of one student. It starts with the greeting and the two buttons.
const defaultLog = (users, studentId) => {
  const s = users.find((u) => u.id === studentId)
  return [
    { id: 1, kind: 'bot', text: `Hi ${s.firstName}! I'm the iGabay Guide. I can help you book a counseling appointment or connect you with a Kaabag for a peer talk.` },
    { id: 2, kind: 'bot', text: 'What would you like to do?' },
    { id: 3, kind: 'buttons', options: ['book', 'peer'], used: false },
  ]
}
function logOf(d, studentId) {
  if (!d.botLog[studentId]) d.botLog[studentId] = defaultLog(d.users, studentId)
  return d.botLog[studentId]
}
const push = (d, studentId, ...items) => { const log = logOf(d, studentId); items.forEach((it) => log.push({ id: nextId(log), ...it })) }
const closeButtons = (d, studentId) => logOf(d, studentId).forEach((it) => { if (it.kind === 'buttons') it.used = true })

export function AppProvider({ children }) {
  const [db, setDb] = useState(load)
  const ref = useRef(db)

  // run a change on a copy of the data, keep it in state and in session storage
  const mutate = useCallback((fn) => {
    const copy = structuredClone(ref.current)
    const result = fn(copy)
    ref.current = copy
    setDb(copy)
    try { sessionStorage.setItem(KEY, JSON.stringify(copy)) } catch { /* ignore */ }
    return result
  }, [])

  const actions = useMemo(() => {
    const slotOf = (d, id) => d.slots.find((s) => s.id === id)
    const counselorOf = (d) => d.users.find((u) => u.role === 'counselor' && u.status === 'active') || d.users.find((u) => u.role === 'counselor')
    const mail = (d, userId, appointmentId, type, subject, message = '', reason = '') => {
      const id = nextId(d.emails)
      d.emails.push({ id, userId, appointmentId, type, subject, message, reason, sentAt: todayISO() })
      return id
    }
    const talkNote = (t, student, kaabag) => t.messages.push({ id: nextId(t.messages), from: 'system', student, kaabag })
    return {
      login(email, password, role) {
        const d = ref.current
        const u = d.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase())
        if (!u || password !== (u.password || seed.DEMO_PASSWORD) || (role && u.role !== role)) return { ok: false, error: 'Incorrect email or password' }
        if (u.status !== 'active') return { ok: false, error: 'This account is deactivated', detail: 'Please contact the guidance office.' }
        mutate((x) => { x.session = u.id })
        return { ok: true, user: u }
      },
      logout: () => mutate((d) => { d.session = null; d.draft = { ...EMPTY_DRAFT } }),
      resetDemo() { const f = freshDb(); ref.current = f; setDb(f); try { sessionStorage.removeItem(KEY) } catch { /* ignore */ } },

      // ----- student chat (Figma S03 to S08, R03, R05, R06) -----
      chooseBook: (studentId) => mutate((d) => {
        closeButtons(d, studentId)
        push(d, studentId, { kind: 'me', text: TEXT.book }, { kind: 'bot', text: 'Before we book, please answer a short well-being assessment.' })
        d.draft = { slotId: null, rebookId: null, step: 'assessment' }
      }),
      chooseRebook: (studentId, appointmentId) => mutate((d) => {
        closeButtons(d, studentId)
        push(d, studentId,
          { kind: 'bot', text: 'Your counselor is unavailable on your appointment day. You can rebook without answering the assessment again.' },
          { kind: 'me', text: 'Rebook appointment' })
        d.draft = { slotId: null, rebookId: appointmentId, step: 'date' }
      }),
      choosePeer: (studentId) => mutate((d) => {
        closeButtons(d, studentId)
        const s = d.users.find((u) => u.id === studentId)
        const kaabag = d.users.find((u) => u.role === 'kaabag' && u.status === 'active')
        const id = nextId(d.peerTalks)
        d.peerTalks.push({
          id, studentId, kaabagId: kaabag ? kaabag.id : null, status: 'ongoing', asked: false,
          messages: [
            { id: 1, from: 'system', student: 'The chatbot has ended. A Kaabag has joined the conversation.', kaabag: 'Chat handed over by the iGabay Guide' },
            { id: 2, from: 'kaabag', text: `Hi ${s.firstName}, I'm a Kaabag. What would you like to talk about?`, at: clock() },
          ],
        })
        push(d, studentId, { kind: 'me', text: TEXT.peer }, { kind: 'talk', talkId: id })
      }),
      submitAssessment: (studentId, scores, concern) => mutate((d) => {
        d.assessments[studentId] = { scores, concern, submittedAt: todayISO() }
        push(d, studentId, { kind: 'me', text: 'Assessment submitted', seen: true },
          { kind: 'bot', text: 'Thank you. Here is your appointment form with your details.' }, { kind: 'card', card: 'form' })
        d.draft.step = null
      }),
      setStep: (step) => mutate((d) => { d.draft.step = step }),
      chooseSlot(slotId) {
        const s = slotOf(ref.current, slotId)
        if (!s || s.status !== 'open') return false
        mutate((d) => { d.draft.slotId = slotId })
        return true
      },
      confirmDateTime: (studentId) => mutate((d) => {
        push(d, studentId, { kind: 'me', text: 'Use this date & time' })
        const form = [...logOf(d, studentId)].reverse().find((x) => x.kind === 'card' && x.card === 'form')
        if (form && !d.draft.rebookId) form.slotId = d.draft.slotId // the form card keeps the chosen time
        d.draft.step = 'review'
      }),
      submitAppointment: (studentId) => mutate((d) => {
        const s = slotOf(d, d.draft.slotId)
        if (!s || s.status !== 'open') return null
        s.status = 'booked'
        const id = nextId(d.appointments)
        d.appointments.push({ id, studentId, counselorId: s.counselorId, slotId: s.id, status: 'booked', cancelReason: '', createdAt: todayISO() })
        mail(d, studentId, id, 'appointment details', 'Your iGabay appointment details')
        const me = d.users.find((u) => u.id === studentId)
        push(d, studentId, { kind: 'me', text: 'Submit appointment', seen: true }, { kind: 'bot', text: 'Your appointment is booked.' },
          { kind: 'card', card: 'booked', appointmentId: id }, { kind: 'bot', text: `The same details were sent to your Gmail: ${me.email}` })
        d.draft = { ...EMPTY_DRAFT }
        return id
      }),
      submitReplacement: (studentId) => mutate((d) => {
        const a = d.appointments.find((x) => x.id === d.draft.rebookId)
        const s = slotOf(d, d.draft.slotId)
        if (!a || !s || s.status !== 'open') return null
        const old = slotOf(d, a.slotId)
        if (old && old.status === 'booked') old.status = 'open'
        s.status = 'booked'; a.slotId = s.id; a.status = 'rescheduled'; a.cancelReason = ''
        mail(d, studentId, a.id, 'appointment details', 'Your appointment was rescheduled')
        const me = d.users.find((u) => u.id === studentId)
        push(d, studentId, { kind: 'me', text: 'Submit replacement', seen: true }, { kind: 'bot', text: 'Your appointment is rescheduled.' },
          { kind: 'card', card: 'rescheduled', appointmentId: a.id }, { kind: 'bot', text: `The same details were sent to your Gmail: ${me.email}` })
        d.draft = { ...EMPTY_DRAFT }
        return a.id
      }),
      cancelAppointment: (appointmentId) => mutate((d) => {
        const a = d.appointments.find((x) => x.id === appointmentId)
        const s = slotOf(d, a.slotId)
        if (s && s.status === 'booked') s.status = 'open'
        a.status = 'cancelled'
        d.draft = { ...EMPTY_DRAFT }
      }),

      // ----- peer talk (Figma K00 to K05) -----
      sendMessage: (talkId, from, text) => mutate((d) => {
        const t = d.peerTalks.find((x) => x.id === talkId)
        if (t && t.status === 'ongoing') t.messages.push({ id: nextId(t.messages), from, text, at: clock() })
      }),
      askCounseling: (talkId) => mutate((d) => {
        const t = d.peerTalks.find((x) => x.id === talkId)
        t.asked = true
        t.messages.push({ id: nextId(t.messages), from: 'kaabag', text: 'Do you want counseling?', at: clock() })
      }),
      endTalk: (talkId) => mutate((d) => {
        const t = d.peerTalks.find((x) => x.id === talkId)
        t.status = 'ended'
        talkNote(t, 'The Kaabag ended the conversation.', 'You ended the conversation. No booking was started.')
        closeButtons(d, t.studentId)
        push(d, t.studentId, { kind: 'bot', text: 'You can come back any time. What would you like to do?' }, { kind: 'buttons', options: ['book', 'peer'], used: false })
      }),
      reconnectTalk: (talkId) => mutate((d) => {
        const t = d.peerTalks.find((x) => x.id === talkId)
        const s = d.users.find((u) => u.id === t.studentId)
        t.status = 'ended'
        talkNote(t, 'The Kaabag ended the peer talk and reconnected you to the iGabay Guide.', 'You reconnected the student to the chatbot to book.')
        closeButtons(d, t.studentId)
        push(d, t.studentId, { kind: 'bot', text: `Welcome back, ${s.firstName}. Let's book your counseling appointment.` }, { kind: 'buttons', options: ['book'], used: false })
      }),

      // ----- Guidance Associate (Figma A01 to A14, R01, R02) -----
      sendAbsenceEmail: (appointmentId, message, reason) => mutate((d) => {
        const a = d.appointments.find((x) => x.id === appointmentId)
        a.status = 'counselor absent'; a.cancelReason = reason
        return mail(d, a.studentId, a.id, 'counselor absence', 'Your counselor is unavailable', message, reason)
      }),
      updateAppointmentStatus: (appointmentId, status, note) => mutate((d) => {
        const a = d.appointments.find((x) => x.id === appointmentId)
        const s = slotOf(d, a.slotId)
        if (status === 'cancelled' && s && s.status === 'booked') s.status = 'open'
        a.status = status
        if (note) a.note = note
      }),
      createUser: (u, profile) => mutate((d) => {
        const id = nextId(d.users)
        d.users.push({ id, status: 'active', createdAt: todayISO(), ...u })
        if (u.role === 'student') d.profiles[id] = profile
        return id
      }),
      updateUser: (id, patch, profile) => mutate((d) => {
        const u = d.users.find((x) => x.id === id)
        Object.assign(u, patch)
        if (u.role === 'student' && profile) d.profiles[id] = profile
      }),
      addSlot: (date, start) => mutate((d) => {
        const c = counselorOf(d)
        const id = `s-${date}-${start}`
        const old = slotOf(d, id)
        if (old) { if (old.status === 'open') return false; if (old.status === 'unavailable') { old.status = 'open'; return true } return false }
        const h = Number(start.slice(0, 2)) + 1
        d.slots.push({ id, counselorId: c.id, date, start, end: `${String(h).padStart(2, '0')}:00`, status: 'open' })
        return true
      }),
      applySlotChanges: (changes) => mutate((d) => {
        Object.entries(changes).forEach(([id, status]) => { const s = slotOf(d, id); if (s && s.status !== 'booked') s.status = status })
      }),

      // ----- Guidance Counselor (Figma C01 to C06) -----
      recordOutcome: (appointmentId, status, notes, followUpDate, followUpTime) => mutate((d) => {
        const a = d.appointments.find((x) => x.id === appointmentId)
        a.status = status
        const cid = nextId(d.caseRecords)
        const need = Boolean(followUpDate)
        d.caseRecords.push({ id: cid, appointmentId, outcomeNotes: notes, followUpNeeded: need, sessionStatus: need ? 'follow-up' : status, recordedAt: todayISO(), followUpDate, followUpTime })
      }),
    }
  }, [mutate])

  const value = useMemo(() => {
    const user = db.users.find((u) => u.id === db.session) || null
    const byId = (id) => db.users.find((u) => u.id === id)
    const slotById = (id) => db.slots.find((s) => s.id === id)
    const counselor = db.users.find((u) => u.role === 'counselor' && u.status === 'active') || db.users.find((u) => u.role === 'counselor')
    const chatLog = (id) => db.botLog[id] || defaultLog(db.users, id)
    return { db, user, byId, slotById, counselor, chatLog, nameOf: (id) => fullName(byId(id)), ...actions }
  }, [db, actions])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(Ctx)
