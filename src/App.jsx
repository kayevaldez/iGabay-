import { Component } from 'react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { AppProvider, useApp } from './state'
import { HOME } from './roles'
import Protected from './components/Protected'
import Login from './pages/Login'
import EmailView from './pages/EmailView'
import StudentHome from './pages/student/Home'
import Chat from './pages/student/Chat'
import StudentAppointments from './pages/student/Appointments'
import Talks from './pages/kaabag/Talks'
import CounselorAppointments from './pages/counselor/Appointments'
import Outcome from './pages/counselor/Outcome'
import Accounts from './pages/associate/Accounts'
import AccountForm from './pages/associate/AccountForm'
import Availability from './pages/associate/Availability'
import AssociateAppointments from './pages/associate/Appointments'
import AppointmentDetails from './pages/associate/AppointmentDetails'
import AbsenceEmail from './pages/associate/AbsenceEmail'
import FollowUps from './pages/associate/FollowUps'
import Reports from './pages/associate/Reports'
import WellbeingAnalytics from './pages/associate/WellbeingAnalytics'

// Shows a friendly message if a page crashes, instead of a blank screen.
class ErrorBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (!this.state.failed) return this.props.children
    return <main className="center-page"><h1>Something went wrong</h1><p>Please reload the page. If it keeps happening, sign out and sign in again.</p><button className="btn" onClick={() => window.location.assign('/')}>Reload</button></main>
  }
}

function Home() {
  const { user } = useApp()
  return <Navigate to={user ? HOME[user.role] : '/login'} replace />
}
function NotFound() {
  return <main className="center-page"><h1>Page not found</h1><p>This page does not exist.</p><Link className="btn" to="/">Go to the start</Link></main>
}
const P = ({ role, children }) => <Protected role={role}>{children}</Protected>

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/email/:id" element={<P role={['student', 'associate']}><EmailView /></P>} />

          <Route path="/student" element={<P role="student"><StudentHome /></P>} />
          <Route path="/student/chat" element={<P role="student"><Chat /></P>} />
          <Route path="/student/appointments" element={<P role="student"><StudentAppointments /></P>} />
          <Route path="/student/appointments/cancelled/:id" element={<P role="student"><StudentAppointments /></P>} />

          <Route path="/kaabag" element={<P role="kaabag"><Talks /></P>} />

          <Route path="/counselor" element={<P role="counselor"><CounselorAppointments /></P>} />
          <Route path="/counselor/appointments/:id" element={<P role="counselor"><Outcome /></P>} />

          <Route path="/associate" element={<P role="associate"><AssociateAppointments /></P>} />
          <Route path="/associate/appointments/:id" element={<P role="associate"><AppointmentDetails /></P>} />
          <Route path="/associate/appointments/:id/absence" element={<P role="associate"><AbsenceEmail /></P>} />
          <Route path="/associate/appointments/:id/sent" element={<P role="associate"><AbsenceEmail sent /></P>} />
          <Route path="/associate/accounts" element={<P role="associate"><Accounts /></P>} />
          <Route path="/associate/accounts/saved" element={<P role="associate"><Accounts saved /></P>} />
          <Route path="/associate/accounts/new" element={<P role="associate"><AccountForm /></P>} />
          <Route path="/associate/accounts/:id/edit" element={<P role="associate"><AccountForm /></P>} />
          <Route path="/associate/availability" element={<P role="associate"><Availability /></P>} />
          <Route path="/associate/followups" element={<P role="associate"><FollowUps /></P>} />
          <Route path="/associate/reports" element={<P role="associate"><Reports /></P>} />
          <Route path="/associate/reports/wellbeing" element={<P role="associate"><WellbeingAnalytics /></P>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppProvider>
    </ErrorBoundary>
  )
}
