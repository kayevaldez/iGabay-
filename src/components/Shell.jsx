import { Link, useLocation } from 'react-router-dom'
import { useApp } from '../state'
import { fullName } from '../utils'
import { ROLE_TITLE } from '../roles'
import Icon from './Icon'

// [link, label, icon, other paths where the link stays selected]
const NAV = {
  student: [['/student', 'Home', 'home', []], ['/student/chat', 'Chat', 'chat', []], ['/student/appointments', 'My appointments', 'calendar', ['/student/appointments']]],
  kaabag: [['/kaabag', 'Peer talks', 'chat', []]],
  counselor: [['/counselor', 'My appointments', 'calendar', ['/counselor/']]],
  associate: [
    ['/associate', 'Appointments & requests', 'list', ['/associate/appointments']], ['/associate/accounts', 'Accounts', 'users', []],
    ['/associate/availability', 'Counselor availability', 'clock', []], ['/associate/followups', 'Follow-up contact', 'phone', []], ['/associate/reports', 'Reports', 'chart', []],
  ],
}

// bare = full-height page without padding (used by the chat screens)
export default function Shell({ role, bare, children }) {
  const { user, logout } = useApp()
  const { pathname } = useLocation()
  if (!user) return null // Protected (in App.jsx) already checks sign-in and role
  const on = (to, extra) => pathname === to || extra.some((p) => pathname.startsWith(p))
  return (
    <div className="app">
      <aside className="side">
        <div className="brand">iGabay</div>
        <p className="org">MSU Naawan<br />Office of Guidance, Counseling<br />and Career Services</p>
        <nav aria-label="Main">
          {NAV[role].map(([to, label, icon, extra]) => (
            <Link key={to} to={to} className={on(to, extra) ? 'active' : ''} aria-current={on(to, extra) ? 'page' : undefined}><Icon name={icon} />{label}</Link>
          ))}
        </nav>
        <div className="side-foot">
          <b>{fullName(user)}</b><span>{ROLE_TITLE[role]}</span>
          <button className="signout" onClick={logout}><Icon name="out" size={16} />Sign out</button>
        </div>
      </aside>
      <main className={`main${bare ? ' bare' : ''}`}>{children}</main>
    </div>
  )
}
