import { useState } from 'react'
import { Link } from 'react-router-dom'
import Shell from '../../components/Shell'
import { Chips, Loading, Notice } from '../../components/ui'
import { AvgBars, Rows } from '../../components/Charts'
import { PERIODS, SCALE_LABELS, TABS, YEAR_LEVELS, withPct } from '../../data/analytics'
import { useLoading } from '../../useLoading'

// Well-being scale analytics (Figma A14). Sample data from the design.
export default function WellbeingAnalytics() {
  const [tab, setTab] = useState('monthly')
  const loading = useLoading(300)
  const d = PERIODS[tab]
  return (
    <Shell role="associate">
      <div className="page" style={{ maxWidth: 1100 }}>
        <div className="head">
          <div><p className="eyebrow">Reports & analytics</p><h1>Well-being scale analytics</h1><p className="lead">{d.title} · {d.assessments} assessments</p></div>
          <div className="row"><span className="badge badge-sample">Sample data — replace with real counts</span><Link className="btn btn-outline" to="/associate/reports">Back to dashboard</Link></div>
        </div>
        <Chips items={TABS} value={tab} onChange={setTab} />
        <Notice title="Not a clinical diagnosis">Scores help counselors prepare. They do not replace the Guidance Counselor's judgment.</Notice>
        {loading ? <Loading label="Loading the report…" /> : (
          <>
            <div className="charts even">
              <section className="card"><h2>Score distribution</h2><div className="big">{d.average.toFixed(1)} <small style={{ fontSize: '.75rem', fontWeight: 400 }}>average out of 5</small></div><Rows rows={withPct(d.scale, SCALE_LABELS)} /></section>
              <section className="card"><h2>{d.avgTitle}</h2><AvgBars labels={d.avgLabels} values={d.avgSeries} /></section>
            </div>
            <section className="card"><h2>Average score by year level</h2><div className="tiles">{YEAR_LEVELS.map((y, i) => <div key={y}>{y}<b>{d.yearAvg[i].toFixed(1)}</b></div>)}</div></section>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Question</th><th>Average (1–5)</th><th>Scale</th></tr></thead>
                <tbody>{d.questionAvg.map((v, i) => <tr key={i}><td>[Assessment question {i + 1}]</td><td>{v.toFixed(1)}</td><td>[Lowest label] → [Highest label]</td></tr>)}</tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </Shell>
  )
}
