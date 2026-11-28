import { Link, Navigate } from 'react-router-dom'
import { useApp } from '../state'
import { HOME, ROLE_LABEL } from '../roles'
import { Notice } from './ui'

// Only a signed-in user can open a page, and only the pages of his or her role (SRS FR-01, FR-02).
export default function Protected({ role, children }) {
  const { user, logout } = useApp()
  if (!user) return <Navigate to="/login" replace />
  const allowed = Array.isArray(role) ? role.includes(user.role) : user.role === role
  if (!allowed) {
    return (
      <main className="center-page">
        <Notice title="This page is not for your role">You are signed in as {ROLE_LABEL[user.role]}. You can open only the pages of your role.</Notice>
        <div className="row"><Link className="btn" to={HOME[user.role]}>Go to my page</Link><button className="btn btn-outline" onClick={logout}>Sign out</button></div>
      </main>
    )
  }
  return children
}
