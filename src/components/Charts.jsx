// Small charts for the Reports screens. They use plain HTML and CSS, no chart library.
export function PairBars({ labels, a, b, nameA = 'Logged in', nameB = 'Booked counseling' }) {
  const max = Math.max(...a, 1)
  return (
    <div role="img" aria-label={`${nameA} and ${nameB}`}>
      <div className="key"><span><i />{nameA}</span><span className="k2"><i />{nameB}</span></div>
      <div className="bars">
        {labels.map((l, i) => (
          <div className="g" key={l}>
            <div className="pair">
              <div className="b">{a[i]}<i style={{ height: `${(a[i] / max) * 78}%` }} /></div>
              <div className="b g2">{b[i]}<i style={{ height: `${(b[i] / max) * 78}%` }} /></div>
            </div>
          </div>
        ))}
      </div>
      <div className="xl">{labels.map((l) => <span key={l}>{l}</span>)}</div>
    </div>
  )
}

export function Rows({ rows }) {
  const max = Math.max(...rows.map((r) => r.n), 1)
  return rows.map((r) => (
    <div className="hrow" key={r.label}>
      <span>{r.label}</span>
      <span className="track"><i style={{ width: `${(r.n / max) * 100}%` }} /></span>
      <b>{r.n}<small>{r.pct}%</small></b>
    </div>
  ))
}

export function AvgBars({ labels, values }) {
  return (
    <div role="img" aria-label="Average score">
      <div className="avgbars">{values.map((v, i) => <div className="a" key={labels[i]}>{v.toFixed(1)}<i style={{ height: `${(v / 5) * 100}%` }} /></div>)}</div>
      <div className="xl" style={{ gap: 22, padding: '0 10px' }}>{labels.map((l) => <span key={l}>{l}</span>)}</div>
    </div>
  )
}
