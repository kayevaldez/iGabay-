import { useState } from 'react'
import { Link } from 'react-router-dom'
import Shell from '../../components/Shell'
import { Chips, Loading } from '../../components/ui'
import { PairBars, Rows } from '../../components/Charts'
import { PERIODS, SCALE_LABELS, TABS, YEAR_LEVELS, withPct } from '../../data/analytics'
import { useLoading } from '../../useLoading'

const CONCERN_LABELS = ['[Concern 1]', '[Concern 2]', '[Concern 3]', '[Concern 4]', '[Concern 5]']

// Reports and analytics (Figma A06, A07, A13). The numbers are sample data from the design.
export default function Reports() {
  const [tab, setTab] = useState('weekly')
  const loading = useLoading(300)
  const d = PERIODS[tab]
  const fPct = Math.round((d.female / d.booked) * 100)
  return (
    <Shell role="associate">
      <div className="page" style={{ maxWidth: 1100 }}>
        <div className="head">
          <div><p className="eyebrow">Reports & analytics</p><h1>Guidance office analytics</h1><p className="lead">{d.title}</p></div>
          <div className="row"><span className="badge badge-sample">Sample data — replace with real counts</span>
            <label className="field" style={{ minWidth: 190 }}><span className="sr">{d.pick}</span><select className="input" aria-label={d.pick} value={d.pickValue} onChange={() => {}}><option>{d.pickValue}</option></select></label></div>
        </div>
        <Chips items={TABS} value={tab} onChange={setTab} />
        {loading ? <Loading label="Loading the report…" /> : (
          <>
            <div className="stats">
              <section className="card"><small>Users who logged in</small><div className="big">{d.logins.toLocaleString()}</div><small>All roles · {d.totalLabel}</small></section>
              <section className="card"><small>Students who booked counseling</small><div className="big">{d.booked}</div>
                <div className="split" role="img" aria-label={`Female ${fPct} percent, male ${100 - fPct} percent`}><i style={{ width: `${fPct}%` }} /></div>
                <div className="two"><div>Female<br /><b>{d.female}</b><small>{fPct}%</small></div><div>Male<br /><b>{d.male}</b><small>{100 - fPct}%</small></div></div>
              </section>
            </div>
            <div className="charts">
              <section className="card"><h2>{d.chartTitle}</h2><PairBars labels={d.labels} a={d.loggedIn} b={d.bookedSeries} nameA="Logged in" nameB="Booked counseling" /></section>
              <section className="card"><h2>Students who booked, by year level</h2><Rows rows={withPct(d.years, YEAR_LEVELS)} /><small>Total: {d.booked.toLocaleString()} students</small></section>
            </div>
            <div className="charts even">
              <section className="card"><h2>Concerns</h2><small>From the concern chosen in the well-being assessment</small><Rows rows={withPct(d.concerns, CONCERN_LABELS)} /></section>
              <section className="card">
                <div className="card-head"><h2>Well-being scale</h2><Link className="link" to="/associate/reports/wellbeing">View well-being analytics →</Link></div>
                <div className="big">{d.average.toFixed(1)} <small style={{ fontSize: '.75rem', fontWeight: 400 }}>average score out of 5</small></div>
                <Rows rows={withPct(d.scale, SCALE_LABELS)} /><small>Not a clinical diagnosis.</small>
              </section>
            </div>
          </>
        )}
      </div>
    </Shell>
  )
}
