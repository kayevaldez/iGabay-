import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useApp } from '../state'
import { DEMO_PASSWORD, users } from '../data/mock'
import { HOME } from '../roles'
import { Field, Notice } from '../components/ui'
import { validEmail } from '../utils'

const TABS = [['student', 'Student'], ['counselor', 'Counselor'], ['associate', 'Associate'], ['kaabag', 'Kaabag']]
// the sample account that each role button fills in (Figma P01)
const SAMPLE = { student: users[0].email, counselor: users[4].email, associate: users[5].email, kaabag: users[6].email }

export default function Login() {
  const { user, login, resetDemo } = useApp()
  const go = useNavigate()
  const [role, setRole] = useState('student')
  const [email, setEmail] = useState(SAMPLE.student)
  const [password, setPassword] = useState(DEMO_PASSWORD)
  const [errors, setErrors] = useState({})
  const [failed, setFailed] = useState(null)
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={HOME[user.role]} replace />

  const pick = (r) => { setRole(r); setEmail(SAMPLE[r]); setPassword(DEMO_PASSWORD); setErrors({}); setFailed(null) }
  const submit = (e) => {
    e.preventDefault()
    const next = {}
    if (!email.trim()) next.email = 'Enter your email address.'
    else if (!validEmail(email.trim())) next.email = 'Enter a valid email address.'
    if (!password) next.password = 'Enter your password.'
    setErrors(next); setFailed(null)
    if (Object.keys(next).length) return
    setBusy(true)
    // short pause, like a real sign in request
    setTimeout(() => {
      const r = login(email, password, role)
      setBusy(false)
      if (r.ok) go(HOME[r.user.role], { replace: true })
      else setFailed(r)
    }, 350)
  }

  return (
    <div className="login">
      <section className="login-art">
        <div>
          <div className="brand">iGabay</div>
          <p className="org">MSU Naawan<br />Office of Guidance, Counseling<br />and Career Services</p>
        </div>
        <div>
          <h2>You don't have to figure it out alone.</h2>
          <p>A private space to take your next step. Connect with a counselor or talk with a peer, at a pace that feels right for you.</p>
        </div>
        <span className="spacer" />
      </section>
      <form className="login-form" onSubmit={submit} noValidate>
        <p className="eyebrow" style={{ margin: 0 }}>Welcome to iGabay</p>
        <h1>A small step starts here.</h1>
        <p className="help" style={{ marginTop: 0 }}>Sign in using the account provided by your guidance office.</p>
        <div className="tabs" role="group" aria-label="Role">
          {TABS.map(([key, label]) => <button key={key} type="button" className={`tab${role === key ? ' on' : ''}`} aria-pressed={role === key} onClick={() => pick(key)}>{label}</button>)}
        </div>
        <Field id="email" label="Email address" error={errors.email}>
          <input id="email" className="input" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field id="password" label="Password" error={errors.password}>
          <input id="password" className="input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        {failed && <Notice title={failed.error}>{failed.detail || 'Check your details and try again.'}</Notice>}
        <button className="btn" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <p className="help">Need help signing in? Contact the guidance office.</p>
        <Notice title="Not suitable for emergencies">Contact the guidance office or emergency services directly for urgent help.</Notice>
        <button type="button" className="link" style={{ alignSelf: 'flex-start' }} onClick={() => { resetDemo(); pick(role) }}>Reset sample data</button>
      </form>
    </div>
  )
}
