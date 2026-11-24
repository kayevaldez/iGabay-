// Sample data that follows the iGabay SRS (Section 5, Chapter 5 data dictionary).
// All names, numbers and dates below are sample values. Edit them here.
export const DEMO_PASSWORD = 'igabay123'
export const DOMAIN = '@msunaawan.edu.ph'

export const users = [
  { id: 1, email: 'faithalexa.jabien' + DOMAIN, firstName: 'Faith Alexa', lastName: 'Jabien', contactNumber: '0917 000 0001', role: 'student', status: 'active', createdAt: '2026-10-05' },
  { id: 2, email: 'student.b' + DOMAIN, firstName: 'Student', lastName: 'B', contactNumber: '0917 000 0002', role: 'student', status: 'active', createdAt: '2026-10-05' },
  { id: 3, email: 'student.c' + DOMAIN, firstName: 'Student', lastName: 'C', contactNumber: '0917 000 0003', role: 'student', status: 'active', createdAt: '2026-10-06' },
  { id: 4, email: 'student.d' + DOMAIN, firstName: 'Student', lastName: 'D', contactNumber: '0917 000 0004', role: 'student', status: 'inactive', createdAt: '2026-10-06' },
  { id: 5, email: 'kaye.valdez' + DOMAIN, firstName: 'Kaye', lastName: 'Valdez', contactNumber: '0917 000 0005', role: 'counselor', status: 'active', createdAt: '2026-09-20' },
  { id: 6, email: 'sam.dadole' + DOMAIN, firstName: 'Sam', lastName: 'Dadole', contactNumber: '0917 000 0006', role: 'associate', status: 'active', createdAt: '2026-09-20' },
  { id: 7, email: 'kaabag.sample' + DOMAIN, firstName: 'Sample', lastName: 'Kaabag', contactNumber: '0917 000 0007', role: 'kaabag', status: 'active', createdAt: '2026-09-22' },
]

export const studentProfiles = {
  1: { studentNumber: '2023-00001', program: 'BS Information Technology', yearLevel: '3rd year' },
  2: { studentNumber: '2023-00002', program: 'BS Information Technology', yearLevel: '3rd year' },
  3: { studentNumber: '2024-00003', program: 'BS Information Technology', yearLevel: '2nd year' },
  4: { studentNumber: '2022-00004', program: 'BS Information Technology', yearLevel: '4th year' },
}

const TIMES = [['10:00', '11:00'], ['11:00', '12:00'], ['14:00', '15:00']]
function buildSlots() {
  const out = []
  for (let d = new Date(2026, 10, 2); d <= new Date(2026, 11, 31); d.setDate(d.getDate() + 1)) {
    if (![1, 3, 5].includes(d.getDay())) continue // Mon, Wed, Fri
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    for (const [start, end] of TIMES) out.push({ id: `s-${date}-${start}`, counselorId: 5, date, start, end, status: 'open' })
  }
  return out
}
export const slots = buildSlots()

export const appointments = [
  { id: 1, studentId: 1, counselorId: 5, slotId: 's-2026-12-16-10:00', remarks: 'Sample note from the appointment form.', status: 'scheduled', cancelReason: '', createdAt: '2026-11-20' },
  { id: 2, studentId: 2, counselorId: 5, slotId: 's-2026-12-16-11:00', remarks: '', status: 'scheduled', cancelReason: '', createdAt: '2026-11-21' },
  { id: 3, studentId: 2, counselorId: 5, slotId: 's-2026-11-04-14:00', remarks: '', status: 'completed', cancelReason: '', createdAt: '2026-11-01' },
  { id: 4, studentId: 1, counselorId: 5, slotId: 's-2026-11-09-11:00', remarks: '', status: 'cancelled', cancelReason: '', createdAt: '2026-11-03' },
  { id: 5, studentId: 2, counselorId: 5, slotId: 's-2026-11-11-10:00', remarks: '', status: 'counselor absent', cancelReason: 'The counselor is attending an official university commitment.', createdAt: '2026-11-05' },
]
// slots used by appointments that are still holding the slot
export const bookedSlotIds = ['s-2026-12-16-10:00', 's-2026-12-16-11:00', 's-2026-11-04-14:00']

export const assessments = { 1: { answers: ['Sample answer'], submittedAt: '2026-11-20' }, 2: { answers: ['Sample answer'], submittedAt: '2026-11-01' } }

export const caseRecords = [
  { id: 1, appointmentId: 3, outcomeNotes: 'Sample outcome: the session was completed and a follow-up was needed.', followUpNeeded: true, sessionStatus: 'follow-up', recordedAt: '2026-11-04' },
]
export const followUps = [
  { id: 1, caseRecordId: 1, studentId: 2, followUpDate: '2026-11-09', status: 'missed', contactedBy: null, contactedVia: null, contactedAt: null },
]

export const peerTalks = [
  {
    id: 1, studentId: 2, kaabagId: 7, status: 'ongoing', asked: false, wantsCounseling: null,
    messages: [
      { id: 1, from: 'student', text: 'Hi, I need someone to talk to.', at: '09:12' },
      { id: 2, from: 'kaabag', text: 'Hi, I am here. Tell me what is on your mind.', at: '09:13' },
    ],
  },
]

export const emails = [
  { id: 1, userId: 1, appointmentId: 1, type: 'appointment details', subject: 'Your iGabay appointment details', body: 'Your counseling appointment is booked. The date, time and counselor are shown below.', sentAt: '2026-11-20', deliveryStatus: 'sent' },
  { id: 2, userId: 2, appointmentId: 5, type: 'counselor absence', subject: 'Your counselor is unavailable', body: 'The counselor will not attend on the appointment day. Reason: The counselor is attending an official university commitment. You can cancel the appointment or rebook.', sentAt: '2026-11-10', deliveryStatus: 'sent' },
]
