import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../state'
import Shell from '../../components/Shell'
import { Chips, EmptyState, Loading, Modal, Notice } from '../../components/ui'
import { useLoading } from '../../useLoading'
import { ROLE_LABEL } from '../../roles'
import { fullName } from '../../utils'

const FILTERS = [['all', 'All roles'], ['student', 'Student'], ['counselor', 'Guidance Counselor'], ['associate', 'Guidance Associate'], ['kaabag', 'Kaabag']]

// User accounts (Figma A03, A09, A10)
export default function Accounts({ saved }) {
  const { db, updateUser } = useApp()
  const loading = useLoading()
  const [filter, setFilter] = useState('all')
  const [confirm, setConfirm] = useState(null)
  const [done, setDone] = useState('')
  const list = db.users.filter((u) => filter === 'all' || u.role === filter)
  const deactivate = () => { updateUser(confirm.id, { status: 'inactive' }); setDone('The account is deactivated.'); setConfirm(null) }
  return (
    <Shell role="associate">
      <div className="page">
        <div className="head">
          <div><p className="eyebrow">Accounts</p><h1>User accounts</h1></div>
          <Link className="btn" to="/associate/accounts/new">+ Create account</Link>
        </div>
        {(saved || done) && <Notice kind="ok">{done || 'The account is saved.'}</Notice>}
        <Chips items={FILTERS} value={filter} onChange={setFilter} />
        {loading ? <Loading label="Loading accounts…" /> : list.length === 0 ? <EmptyState icon="users" title="No accounts">There are no accounts for this role.</EmptyState> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Full name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>{list.map((u) => (
                <tr key={u.id}>
                  <td>{fullName(u)}</td><td>{u.email}</td><td>{ROLE_LABEL[u.role]}</td>
                  <td><span className={`badge badge-${u.status === 'active' ? 'active' : 'deactivated'}`}>{u.status === 'active' ? 'Active' : 'Deactivated'}</span></td>
                  <td><Link className="link" to={`/associate/accounts/${u.id}/edit`}>Edit</Link>{u.status === 'active' && <button className="link" onClick={() => { setDone(''); setConfirm(u) }}>Deactivate</button>}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
      {confirm && (
        <Modal size="small" title="Deactivate this account?" subtitle={`${fullName(confirm)} · ${ROLE_LABEL[confirm.role]}`} onClose={() => setConfirm(null)}
          footer={<><button className="btn btn-outline" onClick={() => setConfirm(null)}>Keep active</button><button className="btn" onClick={deactivate}>Deactivate</button></>}>
          <p>This user will no longer be able to sign in. You can edit the account later.</p>
        </Modal>
      )}
    </Shell>
  )
}
