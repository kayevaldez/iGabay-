import { Link, Navigate } from 'react-router-dom'
import { useApp } from '../state'
import { HOME, ROLE_LABEL } from '../roles'
import { Notice } from './ui'

// FR-01, FR-02: only a signed-in user can open a page, and only the pages of his or her role.
export default function Protected({ role, children }) {
  const { user, logout } = useApp()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) {
    return (
      <main className="center-page">
        <Notice kind="warn" title="This page is not for your role">
          You are signed in as {ROLE_LABEL[user.role]}. You can open only the features of your role.
        </Notice>
        <div className="row"><Link className="btn" to={HOME[user.role]}>Go to my dashboard</Link><button className="btn btn-ghost" onClick={logout}>Sign out</button></div>
      </main>
    )
  }
  return children
}
