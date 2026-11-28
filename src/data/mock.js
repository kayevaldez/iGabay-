// Sample data that follows the iGabay SRS (data dictionary) and the Figma screens.
// All names, numbers and dates below are sample values. Edit them here.
export const DEMO_PASSWORD = 'igabay123'
export const DOMAIN = '@msunaawan.edu.ph'
export const COUNSELOR_ID = 5

export const users = [
  { id: 1, email: 'alexa.jabien' + DOMAIN, firstName: 'Alexa', lastName: 'Jabien', contactNumber: '09170000001', role: 'student', status: 'active', createdAt: '2026-10-05' },
  { id: 2, email: 'student.b@gmail.com', firstName: 'Student', lastName: 'B', contactNumber: '09170000002', role: 'student', status: 'active', createdAt: '2026-10-05' },
  { id: 3, email: 'student.c' + DOMAIN, firstName: 'Student', lastName: 'C', contactNumber: '09170000003', role: 'student', status: 'active', createdAt: '2026-10-06' },
  { id: 4, email: 'student.d' + DOMAIN, firstName: 'Student', lastName: 'D', contactNumber: '', role: 'student', status: 'inactive', createdAt: '2026-10-06' },
  { id: 5, email: 'miko.omondang' + DOMAIN, firstName: 'Miko Neco B.', lastName: 'Omondang', contactNumber: '09170000005', role: 'counselor', status: 'active', createdAt: '2026-09-20' },
  { id: 6, email: 'sam.dadole' + DOMAIN, firstName: 'Sam', lastName: 'Dadole', contactNumber: '09170000006', role: 'associate', status: 'active', createdAt: '2026-09-20' },
  { id: 7, email: 'kaabag' + DOMAIN, firstName: 'Kaabag', lastName: '', contactNumber: '09170000007', role: 'kaabag', status: 'active', createdAt: '2026-09-22' },
  { id: 8, email: 'kaabag.b' + DOMAIN, firstName: 'Sample', lastName: 'Kaabag', contactNumber: '', role: 'kaabag', status: 'inactive', createdAt: '2026-09-22' },
]

// sex and year level are only used for students (Reports)
export const studentProfiles = {
  1: { sex: 'Female', yearLevel: '3rd year' },
  2: { sex: 'Male', yearLevel: '2nd year' },
  3: { sex: 'Female', yearLevel: '1st year' },
  4: { sex: 'Male', yearLevel: '4th year' },
}

// Open times from the Figma availability grid. 4:00 PM is unavailable.
export const TIMES = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00']
const pad = (n) => String(n).padStart(2, '0')
const hourAfter = (t) => `${pad(Number(t.slice(0, 2)) + 1)}:00`
function buildSlots() {
  const out = []
  for (let d = new Date(2026, 10, 2); d <= new Date(2026, 11, 31); d.setDate(d.getDate() + 1)) {
    if (d.getDay() === 0 || d.getDay() === 6) continue // Monday to Friday
    const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    for (const start of TIMES) {
      out.push({ id: `s-${date}-${start}`, counselorId: COUNSELOR_ID, date, start, end: hourAfter(start), status: start === '16:00' ? 'unavailable' : 'open' })
    }
  }
  return out
}
export const slots = buildSlots()

// Slots already taken. The first four belong to the appointments below; the rest are sample bookings by other students.
export const bookedSlotIds = [
  's-2026-12-08-10:00', 's-2026-12-09-10:00', 's-2026-11-04-14:00', 's-2026-11-11-10:00',
  's-2026-12-08-11:00', 's-2026-12-08-14:00',
]
export const fullyBookedDates = ['2026-12-03', '2026-12-17']

export const appointments = [
  { id: 1, studentId: 1, counselorId: COUNSELOR_ID, slotId: 's-2026-12-08-10:00', status: 'booked', cancelReason: '', createdAt: '2026-11-20' },
  { id: 2, studentId: 2, counselorId: COUNSELOR_ID, slotId: 's-2026-12-09-10:00', status: 'rescheduled', cancelReason: '', createdAt: '2026-11-21' },
  { id: 3, studentId: 2, counselorId: COUNSELOR_ID, slotId: 's-2026-11-04-14:00', status: 'completed', cancelReason: '', createdAt: '2026-11-01' },
  { id: 4, studentId: 4, counselorId: COUNSELOR_ID, slotId: 's-2026-11-11-10:00', status: 'no-show', cancelReason: '', createdAt: '2026-11-05' },
  { id: 5, studentId: 2, counselorId: COUNSELOR_ID, slotId: 's-2026-11-09-11:00', status: 'cancelled', cancelReason: '', createdAt: '2026-11-03' },
]

// Assessment answers: three 1 to 5 scores and one main concern (index 0 to 4)
export const assessments = {
  1: { scores: [3, 4, 2], concern: 0, submittedAt: '2026-11-20' },
  2: { scores: [2, 3, 3], concern: 1, submittedAt: '2026-11-01' },
}

export const caseRecords = [
  { id: 1, appointmentId: 3, outcomeNotes: 'Sample outcome: the session was completed and a follow-up was needed.', followUpNeeded: true, sessionStatus: 'follow-up', recordedAt: '2026-11-04' },
  { id: 2, appointmentId: 4, outcomeNotes: 'Sample note: the student did not come.', followUpNeeded: true, sessionStatus: 'follow-up', recordedAt: '2026-11-11' },
]
// Students who did not come to the follow-up (shown after five days without a visit)
export const followUps = [
  { id: 1, caseRecordId: 1, studentId: 2, sessionDate: '2026-11-04', followUpDate: '2026-11-09', status: 'missed' },
  { id: 2, caseRecordId: 2, studentId: 4, sessionDate: '2026-11-11', followUpDate: '2026-11-16', status: 'missed' },
]

export const peerTalks = []
export const emails = [
  { id: 1, userId: 1, appointmentId: 1, type: 'appointment details', subject: 'Your iGabay appointment details', message: '', reason: '', sentAt: '2026-11-20' },
]
