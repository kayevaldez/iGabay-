import Shell from '../../components/Shell'
import { useApp } from '../../state'
import { fullName } from '../../utils'

export default function Profile() {
  const { db, user } = useApp()
  const p = db.profiles[user.id] || {}
  return (
    <Shell role="student" eyebrow="STUDENT / PROFILE" title="My Profile">
      <section className="card"><dl className="details">
        <dt>Name</dt><dd>{fullName(user)}</dd><dt>Email</dt><dd>{user.email}</dd><dt>Contact number</dt><dd>{user.contactNumber}</dd>
        <dt>Student number</dt><dd>{p.studentNumber || '—'}</dd><dt>Program</dt><dd>{p.program || '—'}</dd><dt>Year level</dt><dd>{p.yearLevel || '—'}</dd>
      </dl></section>
    </Shell>
  )
}
