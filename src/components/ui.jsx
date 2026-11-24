export function Notice({ kind = 'info', title, children }) {
  return (
    <div className={`notice notice-${kind}`} role={kind === 'warn' || kind === 'error' ? 'alert' : 'status'}>
      {title && <strong>{title}</strong>}
      {children && <div>{children}</div>}
    </div>
  )
}

export function Badge({ children, tone = 'green' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}

const STATUS_TONE = { scheduled: 'green', completed: 'dark', cancelled: 'gray', 'counselor absent': 'amber', pending: 'amber', attended: 'green', missed: 'amber', active: 'green', inactive: 'gray' }
export const StatusBadge = ({ status }) => <Badge tone={STATUS_TONE[status] || 'gray'}>{status}</Badge>

export function EmptyState({ title, children }) {
  return (
    <div className="empty">
      <strong>{title}</strong>
      {children && <p>{children}</p>}
    </div>
  )
}

export function Loading({ label = 'Loading…' }) {
  return <div className="loading" role="status" aria-live="polite"><span className="spinner" aria-hidden="true" />{label}</div>
}

export function Field({ label, error, hint, children, id }) {
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && !error && <small>{hint}</small>}
      {error && <small className="err" role="alert">{error}</small>}
    </div>
  )
}

export function Stepper({ steps, current }) {
  return (
    <ol className="stepper" aria-label="Booking steps">
      {steps.map((s, i) => <li key={s} className={i + 1 === current ? 'current' : i + 1 < current ? 'done' : ''}><span>{i + 1}</span>{s}</li>)}
    </ol>
  )
}
