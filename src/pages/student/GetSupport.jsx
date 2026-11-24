import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Shell from '../../components/Shell'
import { Notice } from '../../components/ui'
import { useApp } from '../../state'

// FR-03, FR-04: the chatbot gives two buttons and follows a fixed script. No typing.
// FR-05: after Peer talk the chatbot says nothing more and a Kaabag takes over.
export default function GetSupport() {
  const { db, user, startPeerTalk } = useApp()
  const navigate = useNavigate()
  const [log, setLog] = useState([])
  const talks = db.peerTalks.filter((t) => t.studentId === user.id)
  const last = talks[talks.length - 1]
  const reconnected = last && last.status === 'ended' && last.wantsCounseling === true // FR-09
  const handedOver = log.some((m) => m.kind === 'handover')

  function book() {
    setLog((l) => [...l, { from: 'you', text: 'Book a counseling appointment' }, { from: 'bot', text: 'Great. First, please answer a short well-being assessment form.', kind: 'form' }])
  }
  function peer() {
    startPeerTalk(user.id)
    setLog((l) => [...l, { from: 'you', text: 'Have a peer talk with a Kaabag' }, { from: 'bot', text: 'The chatbot ends its part here. A Kaabag, your Student Peer Facilitator, takes over.', kind: 'handover' }])
  }

  return (
    <Shell role="student" eyebrow="STUDENT / GET SUPPORT" title="Let’s find your next step." subtitle="A little guidance to help you reach the right support.">
      <div className="two-col">
        <section className="card chat" aria-label="iGabay assistant">
          <header className="chat-head"><span className="logo" aria-hidden="true">i</span><div><strong>iGabay assistant</strong><small>Your guide to student support</small></div><span className="pill">Button-based chatbot</span></header>
          <div className="chat-body" aria-live="polite">
            <div className="bubble bot">
              <small>iGabay assistant</small>
              <p><strong>Hi, {user.firstName} {user.lastName}. Welcome to iGabay!</strong></p>
              <p>I’m here to help you take the next step. I can guide you to a counseling appointment or connect you with a Kaabag for peer support.</p>
              <p><strong>How would you like to begin?</strong></p>
            </div>
            {reconnected && <div className="bubble bot"><p>Your Kaabag conversation has ended. You said you want counseling, so let’s book your appointment.</p></div>}
            {log.map((m, i) => (
              <div key={i} className={`bubble ${m.from}`}>
                <p>{m.text}</p>
                {m.kind === 'form' && <button className="btn" onClick={() => navigate('/student/assessment')}>Open the well-being form</button>}
                {m.kind === 'handover' && <button className="btn" onClick={() => navigate('/student/peer')}>Open the peer talk</button>}
              </div>
            ))}
          </div>
          {!handedOver && (
            <div className="choices">
              <small>Choose a button to continue</small>
              <button className="btn wide" onClick={book}>Book a counseling appointment <span aria-hidden="true">→</span></button>
              <button className="btn btn-ghost wide" onClick={peer}>Have a peer talk with a Kaabag <span aria-hidden="true">→</span></button>
            </div>
          )}
          <p className="chat-foot">No typing needed. For your privacy, don’t share sensitive details here.</p>
        </section>
        <aside className="card tint">
          <h2>What happens next?</h2>
          <h3>Counseling appointment</h3>
          <p>Well-being form first, then appointment form → calendar → review → confirmation in your Gmail ({user.email}).</p>
          <h3>Peer talk with a Kaabag</h3>
          <p>The chatbot ends its part. A Kaabag, your Student Peer Facilitator, takes over.</p>
          <h3>Guidance, not a diagnosis</h3>
          <p>This assistant follows a set script. It does not analyze concerns or give a clinical diagnosis.</p>
        </aside>
      </div>
      <Notice kind="info" title="Support, not emergency care">iGabay is not suitable for emergencies. If you need urgent help, contact the guidance office or emergency services directly.</Notice>
    </Shell>
  )
}
