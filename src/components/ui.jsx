import { useEffect } from 'react'
import Icon from './Icon'
import { STATUS_LABEL } from '../roles'

export function Notice({ kind = 'warn', title, children }) {
  return (
    <div className={`notice${kind === 'ok' ? ' notice-ok' : ''}`} role={kind === 'ok' ? 'status' : 'alert'}>
      {title && <strong>{title}</strong>}
      {children && <div>{children}</div>}
    </div>
  )
}

export function StatusBadge({ status, needsAction }) {
  const key = needsAction && status === 'counselor absent' ? 'needs-action' : status.replace(' ', '-')
  const text = needsAction && status === 'counselor absent' ? 'Needs action' : STATUS_LABEL[status] || status
  return <span className={`badge badge-${key}`}>{text}</span>
}

export function EmptyState({ icon = 'calendar', title, children, action }) {
  return (
    <div className="card empty">
      <span className="ico"><Icon name={icon} /></span>
      <strong>{title}</strong>
      {children && <p>{children}</p>}
      {action && <div style={{ marginTop: 10 }}>{action}</div>}
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
      {error ? <small className="err" role="alert">{error}</small> : hint && <small>{hint}</small>}
    </div>
  )
}

export function Chips({ items, value, onChange }) {
  return (
    <div className="chips" role="tablist">
      {items.map(([key, label]) => <button key={key} type="button" role="tab" aria-selected={value === key} className={`chip${value === key ? ' on' : ''}`} onClick={() => onChange(key)}>{label}</button>)}
    </div>
  )
}

// Pop-up window. It closes with Escape and with the X button.
export function Modal({ title, subtitle, onClose, children, footer, size = '' }) {
  useEffect(() => {
    const f = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  }, [onClose])
  return (
    <div className="overlay">
      <div className={`modal ${size}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
          <button type="button" className="x" aria-label="Close" onClick={onClose}><Icon name="x" size={16} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  )
}
