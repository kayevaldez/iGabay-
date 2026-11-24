import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useApp } from '../state'
import { HOME } from '../roles'
import { DEMO_PASSWORD, users } from '../data/mock'
import { validEmail } from '../utils'
import { Field, Notice } from '../components/ui'

// FR-01, FR-02: secure login, then each role opens only its own features
export default function Login() {
  const { user, login, resetDemo } = useApp()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={HOME[user.role]} replace />

  function submit(e) {
    e.preventDefault()
    const next = {}
    if (!email.trim()) next.email = 'Enter your institutional email.'
    else if (!validEmail(email.trim())) next.email = 'Enter a valid email, like name@msunaawan.edu.ph.'
    if (!password) next.password = 'Enter your password.'
    setErrors(next)
    setFormError('')
    if (Object.keys(next).length) return
    setBusy(true)
    setTimeout(() => { // pretend the request takes a moment
      try {
        const res = login(email, password)
        setBusy(false)
        if (!res.ok) return setFormError(res.error)
        navigate(HOME[res.user.role], { replace: true })
      } catch {
        setBusy(false)
        setFormError('Something went wrong. Please try again.')
      }
    }, 500)
  }

  return (
    <div className="login">
      <section className="login-form">
        <div className="brand"><span className="logo" aria-hidden="true">i</span><span>iGabay</span></div>
        <h1>Welcome to iGabay</h1>
        <p className="lead">Sign in with the account provided for your university role.</p>
        <form onSubmit={submit} noValidate>
          <Field label="Email" id="email" error={errors.email}>
            <input id="email" type="email" autoComplete="username" placeholder="Enter your account identifier" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Password" id="password" error={errors.password}>
            <input id="password" type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          {formError && <Notice kind="error" title="Could not sign in">{formError}</Notice>}
          <button className="btn" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        </form>
        <Notice title="Secure, role-based access">Your account opens only the features of your role: Student, Guidance Associate, Guidance Counselor, or Kaabag.</Notice>
        <Notice kind="warn" title="Not suitable for emergencies">Contact the Guidance office or emergency services directly if you need urgent help.</Notice>
        <details className="demo">
          <summary>Sample accounts for this demo</summary>
          <p>Password for all: <code>{DEMO_PASSWORD}</code></p>
          <ul>
            {users.map((u) => (
              <li key={u.id}><button type="button" className="link-btn" onClick={() => { setEmail(u.email); setPassword(DEMO_PASSWORD) }}>{u.email}</button> <small>({u.role}{u.status === 'inactive' ? ', inactive' : ''})</small></li>
            ))}
          </ul>
          <button type="button" className="link-btn" onClick={resetDemo}>Reset sample data</button>
        </details>
      </section>
      <section className="login-art" aria-hidden="true">
        <h2>A quieter first step. A place for support.</h2>
        <p>Request counseling discreetly, or connect with a Kaabag. Take your next step at your own pace.</p>
        <small>Office of Guidance, Counseling, and Career Services (OGCCS) under the Office of Student Welfare, MSU Naawan</small>
      </section>
    </div>
  )
}
