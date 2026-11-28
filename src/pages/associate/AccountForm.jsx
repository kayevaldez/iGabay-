import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../../state'
import Shell from '../../components/Shell'
import { Field, Notice } from '../../components/ui'
import { ROLE_LABEL } from '../../roles'
import { allowedEmail, fullName } from '../../utils'

const STRONG = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

// Create account (Figma A04) and edit account
export default function AccountForm() {
  const { id } = useParams()
  const { db, createUser, updateUser } = useApp()
  const go = useNavigate()
  const editing = id ? db.users.find((u) => u.id === Number(id)) : null
  const profile = editing ? db.profiles[editing.id] || {} : {}
  const [f, setF] = useState({
    name: editing ? fullName(editing) : '', role: editing ? editing.role : 'student', email: editing ? editing.email : '', contact: editing ? editing.contactNumber : '',
    sex: profile.sex || 'Female', year: profile.yearLevel || '1st year', password: '', status: editing ? editing.status : 'active',
  })
  const [errors, setErrors] = useState({})
  if (id && !editing) return <Navigate to="/associate/accounts" replace />
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const save = (e) => {
    e.preventDefault()
    const next = {}
    const name = f.name.trim().replace(/\s+/g, ' ')
    if (!name) next.name = 'Full name is required.'
    else if (name.length > 100) next.name = 'Full name can be up to 100 characters.'
    if (!f.email.trim()) next.email = 'Email address is required.'
    else if (!allowedEmail(f.email.trim())) next.email = 'Use a valid @msunaawan.edu.ph or @gmail.com address.'
    else if (db.users.some((u) => u.email.toLowerCase() === f.email.trim().toLowerCase() && u.id !== (editing && editing.id))) next.email = 'This email address is already used.'
    if (f.contact && !/^09\d{9}$/.test(f.contact)) next.contact = 'Enter 11 digits that start with 09.'
    if (!editing && !f.password) next.password = 'A temporary password is required.'
    else if (f.password && !STRONG.test(f.password)) next.password = 'At least 8 characters, 1 uppercase letter, 1 number and 1 special character.'
    setErrors(next)
    if (Object.keys(next).length) return
    const parts = name.split(' ')
    const patch = { firstName: parts.length > 1 ? parts.slice(0, -1).join(' ') : parts[0], lastName: parts.length > 1 ? parts[parts.length - 1] : '', email: f.email.trim(), contactNumber: f.contact, role: f.role }
    if (f.password) patch.password = f.password
    const prof = f.role === 'student' ? { sex: f.sex, yearLevel: f.year } : undefined
    if (editing) updateUser(editing.id, { ...patch, status: f.status }, prof)
    else createUser(patch, prof)
    go('/associate/accounts/saved')
  }
  const hasErrors = Object.keys(errors).length > 0
  return (
    <Shell role="associate">
      <div className="page">
        <div><p className="eyebrow">Accounts</p><h1>{editing ? 'Edit account' : 'Create account'}</h1></div>
        <form className="card stack" style={{ maxWidth: 700 }} onSubmit={save} noValidate>
          {hasErrors && <Notice title="Please complete the required fields">Full name and a valid email address are required.</Notice>}
          <div className="grid2">
            <Field id="name" label="Full name *" error={errors.name}><input id="name" className="input" maxLength={120} placeholder="Up to 100 characters" value={f.name} onChange={set('name')} /></Field>
            <Field id="role" label="Role *"><select id="role" className="input" value={f.role} onChange={set('role')}>{Object.entries(ROLE_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Field>
            <Field id="email" label="Email address *" error={errors.email}><input id="email" className="input" type="email" value={f.email} onChange={set('email')} /></Field>
            <Field id="contact" label="Contact number" error={errors.contact} hint="11 digits"><input id="contact" className="input" inputMode="numeric" maxLength={11} placeholder="09XXXXXXXXX" value={f.contact} onChange={set('contact')} /></Field>
            {f.role === 'student' && <>
              <Field id="sex" label="Sex (students)"><select id="sex" className="input" value={f.sex} onChange={set('sex')}><option>Female</option><option>Male</option></select></Field>
              <Field id="year" label="Year level (students)"><select id="year" className="input" value={f.year} onChange={set('year')}>{['1st year', '2nd year', '3rd year', '4th year'].map((y) => <option key={y}>{y}</option>)}</select></Field>
            </>}
            <Field id="pw" label={editing ? 'New temporary password (optional)' : 'Temporary password *'} error={errors.password} hint="At least 8 characters, 1 uppercase letter, 1 number and 1 special character.">
              <input id="pw" className="input" type="password" autoComplete="new-password" value={f.password} onChange={set('password')} />
            </Field>
            {editing && <Field id="st" label="Status"><select id="st" className="input" value={f.status} onChange={set('status')}><option value="active">Active</option><option value="inactive">Deactivated</option></select></Field>}
          </div>
          <div className="row"><Link className="btn btn-outline" to="/associate/accounts">Back to dashboard</Link><button className="btn" type="submit">Save account</button></div>
        </form>
      </div>
    </Shell>
  )
}
