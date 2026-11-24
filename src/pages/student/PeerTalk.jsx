import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Shell from '../../components/Shell'
import { EmptyState, Notice } from '../../components/ui'
import { useApp } from '../../state'
import { fullName } from '../../utils'

// FR-06 to FR-09 (student side)
export default function PeerTalk() {
  const { db, user, byId, sendMessage, answerCounseling } = useApp()
  const [text, setText] = useState('')
  const end = useRef(null)
  const talks = db.peerTalks.filter((t) => t.studentId === user.id)
  const talk = talks[talks.length - 1]
  useEffect(() => { end.current?.scrollIntoView?.({ block: 'end' }) }, [talk?.messages.length])

  function send(e) {
    e.preventDefault()
    if (!text.trim()) return
    sendMessage(talk.id, 'student', text.trim())
    setText('')
  }

  return (
    <Shell role="student" eyebrow="STUDENT / PEER TALK" title="One-on-one peer talk" subtitle="Talk with your Kaabag. The chatbot is no longer part of this conversation.">
      {!talk ? (
        <EmptyState title="No peer talk yet">Choose “Have a peer talk with a Kaabag” in <Link to="/student/support">Get support</Link> to start.</EmptyState>
      ) : (
        <div className="two-col">
          <section className="card chat">
            <header className="chat-head"><div><strong>Kaabag: {fullName(byId(talk.kaabagId))}</strong><small>Student Peer Facilitator</small></div><span className="pill">{talk.status === 'ongoing' ? 'Ongoing' : 'Ended'}</span></header>
            <div className="chat-body">
              {talk.messages.length === 0 && <EmptyState title="No messages yet">Say hello. Your Kaabag will reply here.</EmptyState>}
              {talk.messages.map((m) => <div key={m.id} className={`bubble ${m.from === 'student' ? 'you' : 'bot'}`}><small>{m.from === 'student' ? 'You' : 'Kaabag'} · {m.at}</small><p>{m.text}</p></div>)}
              <div ref={end} />
            </div>
            {talk.status === 'ongoing' && talk.asked && talk.wantsCounseling === null && (
              <div className="choices"><small>Your Kaabag asked: do you want counseling?</small>
                <div className="row"><button className="btn" onClick={() => answerCounseling(talk.id, true)}>Yes, I want counseling</button><button className="btn btn-ghost" onClick={() => answerCounseling(talk.id, false)}>No, thank you</button></div>
              </div>
            )}
            {talk.status === 'ongoing' && (
              <form className="composer" onSubmit={send}>
                <label className="sr" htmlFor="msg">Message</label>
                <input id="msg" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message" />
                <button className="btn" type="submit" disabled={!text.trim()}>Send</button>
              </form>
            )}
          </section>
          <aside className="card tint">
            <h2>After the peer talk</h2>
            {talk.status === 'ongoing' && talk.wantsCounseling === null && <p>Your Kaabag may ask if you want counseling. You can answer yes or no.</p>}
            {talk.status === 'ended' && talk.wantsCounseling === true && (
              <><Notice kind="info" title="Kaabag conversation ended">You chose counseling. You are reconnected to the chatbot to book an appointment.</Notice><Link className="btn" to="/student/support">Back to the chatbot</Link></>
            )}
            {talk.wantsCounseling === false && <Notice title="No counseling for now">{talk.status === 'ended' ? 'The conversation is closed.' : 'Your Kaabag can end the conversation. No booking is started.'}</Notice>}
          </aside>
        </div>
      )}
    </Shell>
  )
}
