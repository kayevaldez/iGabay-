import { Component } from 'react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { AppProvider, useApp } from './state'
import { HOME } from './roles'
import Protected from './components/Protected'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import GetSupport from './pages/student/GetSupport'
import PeerTalk from './pages/student/PeerTalk'
import Assessment from './pages/student/Assessment'
import Appointment from './pages/student/Appointment'
import SelectDate from './pages/student/SelectDate'
import Review from './pages/student/Review'
import Appointments from './pages/student/Appointments'
import Inbox from './pages/student/Inbox'
import Profile from './pages/student/Profile'
import Talks from './pages/kaabag/Talks'
import CounselorAppointments from './pages/counselor/Appointments'
import Accounts from './pages/associate/Accounts'
import Availability from './pages/associate/Availability'
import AssociateAppointments from './pages/associate/Appointments'
import FollowUps from './pages/associate/FollowUps'
import Reports from './pages/associate/Reports'

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

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/student" element={<Protected role="student"><Dashboard role="student" /></Protected>} />
          <Route path="/student/support" element={<Protected role="student"><GetSupport /></Protected>} />
          <Route path="/student/peer" element={<Protected role="student"><PeerTalk /></Protected>} />
          <Route path="/student/assessment" element={<Protected role="student"><Assessment /></Protected>} />
          <Route path="/student/appointment" element={<Protected role="student"><Appointment /></Protected>} />
          <Route path="/student/select-date" element={<Protected role="student"><SelectDate /></Protected>} />
          <Route path="/student/review" element={<Protected role="student"><Review /></Protected>} />
          <Route path="/student/appointments" element={<Protected role="student"><Appointments /></Protected>} />
          <Route path="/student/appointments/:id" element={<Protected role="student"><Appointments /></Protected>} />
          <Route path="/student/inbox" element={<Protected role="student"><Inbox /></Protected>} />
          <Route path="/student/profile" element={<Protected role="student"><Profile /></Protected>} />
          <Route path="/kaabag" element={<Protected role="kaabag"><Dashboard role="kaabag" /></Protected>} />
          <Route path="/kaabag/talks" element={<Protected role="kaabag"><Talks /></Protected>} />
          <Route path="/counselor" element={<Protected role="counselor"><Dashboard role="counselor" /></Protected>} />
          <Route path="/counselor/appointments" element={<Protected role="counselor"><CounselorAppointments /></Protected>} />
          <Route path="/associate" element={<Protected role="associate"><Dashboard role="associate" /></Protected>} />
          <Route path="/associate/accounts" element={<Protected role="associate"><Accounts /></Protected>} />
          <Route path="/associate/availability" element={<Protected role="associate"><Availability /></Protected>} />
          <Route path="/associate/appointments" element={<Protected role="associate"><AssociateAppointments /></Protected>} />
          <Route path="/associate/followups" element={<Protected role="associate"><FollowUps /></Protected>} />
          <Route path="/associate/reports" element={<Protected role="associate"><Reports /></Protected>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppProvider>
    </ErrorBoundary>
  )
}
