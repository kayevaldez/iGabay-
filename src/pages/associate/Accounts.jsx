import { useState } from 'react'
import Shell from '../../components/Shell'
import { EmptyState, Field, Loading, Notice, StatusBadge } from '../../components/ui'
import { useLoading } from '../../useLoading'
import { useApp } from '../../state'
import { fullName, validEmail } from '../../utils'

// FR-28: create, edit and deactivate accounts
const EMPTY = { firstName: '', lastName: '', email: '', contactNumber: '', role: 'student' }
const ROLES = [['student', 'Student'], ['kaabag', 'Kaabag'], ['counselor', 'Guidance Counselor'], ['associate', 'Guidance Associate']]

export default function Accounts() {
  const { db, createUser, updateUser } = useApp()
  const loading = useLoading()
  const [filter, setFilter] = useState('all')
  const [form, setForm] = useState(null) // null = hidden, {id?...} = create or edit
  const [errors, setErrors] = useState({})
  const [done, setDone] = useState('')
  const list = db.users.filter((u) => filter === 'all' || u.role === filter)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  function save(e) {
    e.preventDefault()
    const err = {}
    if (!form.firstName.trim()) err.firstName = 'Enter a first name.'
    if (!form.lastName.trim()) err.lastName = 'Enter a last name.'
    if (!validEmail(form.email.trim())) err.email = 'Enter a valid email.'
    else if (db.users.some((u) => u.email.toLowerCase() === form.email.trim().toLowerCase() && u.id !== form.id)) err.email = 'This email already has an account.'
    setErrors(err)
    if (Object.keys(err).length) return
    const data = { firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim(), contactNumber: form.contactNumber.trim(), role: form.role }
    if (form.id) { updateUser(form.id, data); setDone('Account updated.') } else { createUser(data); setDone('Account created.') }
    setForm(null)
  }

  return (
    <Shell role="associate" eyebrow="ASSOCIATE / ACCOUNTS" title="Accounts administration" subtitle="Create, edit and deactivate user accounts.">
      {done && <Notice title={done} />}
      <div className="row"><label htmlFor="rf">Role filter</label>
        <select id="rf" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">All roles</option>{ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        <button className="btn" onClick={() => { setForm({ ...EMPTY }); setErrors({}); setDone('') }}>Create account</button></div>
      {form && (
        <form className="card" onSubmit={save} noValidate>
          <h2>{form.id ? 'Edit account' : 'New account'}</h2>
          <div className="grid cols-2">
            <Field id="fn" label="First name" error={errors.firstName}><input id="fn" value={form.firstName} onChange={set('firstName')} /></Field>
            <Field id="ln" label="Last name" error={errors.lastName}><input id="ln" value={form.lastName} onChange={set('lastName')} /></Field>
            <Field id="em" label="Email" error={errors.email}><input id="em" type="email" value={form.email} onChange={set('email')} /></Field>
            <Field id="cn" label="Contact number"><input id="cn" value={form.contactNumber} onChange={set('contactNumber')} /></Field>
            <Field id="ro" label="Role"><select id="ro" value={form.role} onChange={set('role')}>{ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
          </div>
          <div className="row"><button className="btn" type="submit">Save account</button><button type="button" className="btn btn-ghost" onClick={() => setForm(null)}>Cancel</button></div>
        </form>
      )}
      {loading ? <Loading /> : list.length === 0 ? <EmptyState title="No accounts for this role" /> : (
        <div className="table-wrap"><table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{list.map((u) => (
            <tr key={u.id}><td>{fullName(u)}</td><td>{u.email}</td><td>{ROLES.find((r) => r[0] === u.role)[1]}</td><td><StatusBadge status={u.status} /></td>
              <td><button className="link-btn" onClick={() => { setForm({ ...u }); setErrors({}); setDone('') }}>Edit</button>{' · '}
                <button className="link-btn" onClick={() => { updateUser(u.id, { status: u.status === 'active' ? 'inactive' : 'active' }); setDone(`${fullName(u)} is now ${u.status === 'active' ? 'inactive' : 'active'}.`) }}>{u.status === 'active' ? 'Deactivate' : 'Activate'}</button></td></tr>))}</tbody>
        </table></div>
      )}
    </Shell>
  )
}
