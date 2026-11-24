import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import * as seed from './data/mock'
import { addDays, clock, fmtDate, fmtTime, fullName, todayISO } from './utils'

const KEY = 'igabay-demo-db-v1'
const Ctx = createContext(null)

function freshDb() {
  const db = structuredClone({
    users: seed.users, profiles: seed.studentProfiles, slots: seed.slots, appointments: seed.appointments,
    assessments: seed.assessments, caseRecords: seed.caseRecords, followUps: seed.followUps,
    peerTalks: seed.peerTalks, emails: seed.emails, session: null, draft: { answers: null, remarks: '', slotId: null, rebookId: null },
  })
  db.slots.forEach((s) => { if (seed.bookedSlotIds.includes(s.id)) s.status = 'booked' })
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
    const mail = (d, userId, appointmentId, type, subject, body) =>
      d.emails.push({ id: nextId(d.emails), userId, appointmentId, type, subject, body, sentAt: todayISO(), deliveryStatus: 'sent' })
    return {
      login(email, password) {
        const d = ref.current
        const u = d.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase())
        if (!u || password !== seed.DEMO_PASSWORD) return { ok: false, error: 'Wrong email or password. Please check and try again.' }
        if (u.status !== 'active') return { ok: false, error: 'This account is inactive. Please contact the Guidance Associate.' }
        mutate((x) => { x.session = u.id })
        return { ok: true, user: u }
      },
      logout: () => mutate((d) => { d.session = null; d.draft = { answers: null, remarks: '', slotId: null, rebookId: null } }),
      resetDemo() { const f = freshDb(); ref.current = f; setDb(f); try { sessionStorage.removeItem(KEY) } catch { /* ignore */ } },

      // peer talk (FR-05 to FR-09)
      startPeerTalk(studentId) {
        return mutate((d) => {
          const open = d.peerTalks.find((t) => t.studentId === studentId && t.status === 'ongoing')
          if (open) return open.id
          const kaabag = d.users.find((u) => u.role === 'kaabag' && u.status === 'active')
          const id = nextId(d.peerTalks)
          d.peerTalks.push({ id, studentId, kaabagId: kaabag ? kaabag.id : null, status: 'ongoing', asked: false, wantsCounseling: null, messages: [] })
          return id
        })
      },
      sendMessage: (talkId, from, text) => mutate((d) => {
        const t = d.peerTalks.find((x) => x.id === talkId)
        if (t && t.status === 'ongoing') t.messages.push({ id: nextId(t.messages), from, text, at: clock() })
      }),
      askCounseling: (talkId) => mutate((d) => {
        const t = d.peerTalks.find((x) => x.id === talkId)
        t.asked = true
        t.messages.push({ id: nextId(t.messages), from: 'kaabag', text: 'Do you want counseling?', at: clock() })
      }),
      answerCounseling: (talkId, yes) => mutate((d) => {
        const t = d.peerTalks.find((x) => x.id === talkId)
        t.wantsCounseling = yes
        t.messages.push({ id: nextId(t.messages), from: 'student', text: yes ? 'Yes, I want counseling.' : 'No, thank you.', at: clock() })
        if (yes) t.status = 'ended' // FR-09: Kaabag conversation ends, student goes back to the chatbot
      }),
      endTalk: (talkId) => mutate((d) => { d.peerTalks.find((x) => x.id === talkId).status = 'ended' }),

      // booking (FR-10 to FR-20)
      saveAssessment: (studentId, answers) => mutate((d) => {
        d.assessments[studentId] = { answers, submittedAt: todayISO() }
        d.draft.answers = answers
      }),
      setRemarks: (remarks) => mutate((d) => { d.draft.remarks = remarks }),
      pickSlot(slotId) {
        const s = slotOf(ref.current, slotId)
        if (!s || s.status !== 'open') return { ok: false, error: `${s ? fmtTime(s.start) : 'That time'} is already booked. Please choose another open time.` }
        mutate((d) => { d.draft.slotId = slotId })
        return { ok: true }
      },
      startRebook: (appointmentId) => mutate((d) => { d.draft.rebookId = appointmentId; d.draft.slotId = null }),
      submitAppointment(studentId) {
        return mutate((d) => {
          const s = slotOf(d, d.draft.slotId)
          if (!s || s.status !== 'open') return null
          s.status = 'booked'
          const id = nextId(d.appointments)
          d.appointments.push({ id, studentId, counselorId: s.counselorId, slotId: s.id, remarks: d.draft.remarks, status: 'scheduled', cancelReason: '', createdAt: todayISO() })
          const c = d.users.find((u) => u.id === s.counselorId)
          mail(d, studentId, id, 'appointment details', 'Your iGabay appointment details',
            `Your counseling appointment is booked with ${fullName(c)} on ${fmtDate(s.date)} at ${fmtTime(s.start)}.`)
          d.draft = { answers: null, remarks: '', slotId: null, rebookId: null }
          return id
        })
      },
      rebook(appointmentId) {
        return mutate((d) => {
          const a = d.appointments.find((x) => x.id === appointmentId)
          const s = slotOf(d, d.draft.slotId)
          if (!a || !s || s.status !== 'open') return null
          const old = slotOf(d, a.slotId)
          if (old && old.status === 'booked') old.status = 'open'
          s.status = 'booked'; a.slotId = s.id; a.status = 'scheduled'; a.cancelReason = ''
          mail(d, a.studentId, a.id, 'appointment details', 'Your appointment was rescheduled',
            `Your appointment is now on ${fmtDate(s.date)} at ${fmtTime(s.start)}.`)
          d.draft = { answers: null, remarks: '', slotId: null, rebookId: null }
          return a.id
        })
      },
      cancelAppointment: (appointmentId) => mutate((d) => {
        const a = d.appointments.find((x) => x.id === appointmentId)
        const s = slotOf(d, a.slotId)
        if (s && s.status === 'booked') s.status = 'open'
        a.status = 'cancelled'
      }),
      sendAbsenceEmail: (appointmentId, reason) => mutate((d) => {
        const a = d.appointments.find((x) => x.id === appointmentId)
        a.status = 'counselor absent'; a.cancelReason = reason
        mail(d, a.studentId, a.id, 'counselor absence', 'Your counselor is unavailable',
          `The counselor will not attend on the appointment day. Reason: ${reason} You can cancel the appointment or rebook.`)
      }),

      // counselor (FR-25 to FR-27)
      recordOutcome: (appointmentId, notes, followUpNeeded, followUpDate) => mutate((d) => {
        const a = d.appointments.find((x) => x.id === appointmentId)
        a.status = 'completed'
        const cid = nextId(d.caseRecords)
        d.caseRecords.push({ id: cid, appointmentId, outcomeNotes: notes, followUpNeeded, sessionStatus: followUpNeeded ? 'follow-up' : 'completed', recordedAt: todayISO() })
        if (followUpNeeded) d.followUps.push({ id: nextId(d.followUps), caseRecordId: cid, studentId: a.studentId, followUpDate, status: 'pending', contactedBy: null, contactedVia: null, contactedAt: null })
      }),

      // associate (FR-28 to FR-32)
      createUser: (u) => mutate((d) => {
        const id = nextId(d.users)
        d.users.push({ id, status: 'active', createdAt: todayISO(), ...u })
        if (u.role === 'student') d.profiles[id] = { studentNumber: u.studentNumber || '', program: u.program || '', yearLevel: u.yearLevel || '' }
      }),
      updateUser: (id, patch) => mutate((d) => { Object.assign(d.users.find((x) => x.id === id), patch) }),
      addSlot: (counselorId, date, start, end) => mutate((d) => {
        const id = `s-${date}-${start}`
        if (d.slots.some((s) => s.id === id)) return false
        d.slots.push({ id, counselorId, date, start, end, status: 'open' })
        return true
      }),
      toggleSlot: (slotId) => mutate((d) => {
        const s = slotOf(d, slotId)
        if (s.status === 'open') s.status = 'unavailable'
        else if (s.status === 'unavailable') s.status = 'open'
      }),
      markFollowUp: (id, status, via, byId) => mutate((d) => {
        const f = d.followUps.find((x) => x.id === id)
        f.status = status
        if (via) { f.contactedVia = via; f.contactedBy = byId; f.contactedAt = todayISO() }
      }),
      followUpLimit: (sessionDate) => addDays(sessionDate, 5),
    }
  }, [mutate])

  const value = useMemo(() => {
    const user = db.users.find((u) => u.id === db.session) || null
    const byId = (id) => db.users.find((u) => u.id === id)
    const slotById = (id) => db.slots.find((s) => s.id === id)
    return { db, user, byId, slotById, ...actions }
  }, [db, actions])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(Ctx)
