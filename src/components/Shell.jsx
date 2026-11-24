import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useApp } from '../state'
import { fullName } from '../utils'
import { HOME, ROLE_LABEL } from '../roles'

const NAV = {
  student: [['/student', 'Dashboard'], ['/student/support', 'Get support'], ['/student/appointments', 'My Appointments'], ['/student/inbox', 'Gmail inbox'], ['/student/profile', 'My Profile']],
  kaabag: [['/kaabag', 'Dashboard'], ['/kaabag/talks', 'Peer talks']],
  counselor: [['/counselor', 'Dashboard'], ['/counselor/appointments', 'Appointments']],
  associate: [['/associate', 'Dashboard'], ['/associate/accounts', 'Accounts'], ['/associate/availability', 'Counselor availability'], ['/associate/appointments', 'Appointments'], ['/associate/followups', 'Follow-up contacts'], ['/associate/reports', 'Analytics & reporting']],
}

export default function Shell({ role, eyebrow, title, subtitle, children }) {
  const { user, logout } = useApp()
  const [open, setOpen] = useState(false)
  if (!user) return null // Protected (in App.jsx) already checks sign-in and role
  return (
    <div className="shell">
      <aside className={`side${open ? ' open' : ''}`}>
        <div className="brand"><span className="logo" aria-hidden="true">i</span><span>iGabay</span></div>
        <p className="org">MSU NAAWAN · OGCCS<br /><strong>{ROLE_LABEL[role]}</strong></p>
        <nav aria-label="Main">
          {NAV[role].map(([to, label]) => (
            <NavLink key={to} to={to} end={to === HOME[role]} onClick={() => setOpen(false)}>{label}</NavLink>
          ))}
        </nav>
        <button className="link-btn signout" onClick={logout}>Sign out</button>
        <p className="org small">Office of Student Welfare, Mindanao State University at Naawan</p>
      </aside>
      <div className="main">
        <header className="top">
          <button className="menu-btn" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(!open)}>☰</button>
          <span className="tagline">Mental wellness screening &amp; referral support</span>
          <span className="who">{fullName(user)}</span>
        </header>
        <main className="content">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1>{title}</h1>
          {subtitle && <p className="lead">{subtitle}</p>}
          {children}
          <footer className="foot">OGCCS · Office of Student Welfare · MSU Naawan · Sample data only. Access personal information only for your authorized role.</footer>
        </main>
      </div>
    </div>
  )
}
