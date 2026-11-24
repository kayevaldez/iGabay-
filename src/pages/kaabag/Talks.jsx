import { useState } from 'react'
import Shell from '../../components/Shell'
import { EmptyState, Loading, Notice, StatusBadge } from '../../components/ui'
import { useLoading } from '../../useLoading'
import { useApp } from '../../state'
import { fullName } from '../../utils'

// FR-06 to FR-09 (Kaabag side)
export default function Talks() {
  const { db, user, byId, sendMessage, askCounseling, endTalk } = useApp()
  const loading = useLoading()
  const talks = db.peerTalks.filter((t) => t.kaabagId === user.id)
  const [openId, setOpenId] = useState(null)
  const [text, setText] = useState('')
  const talk = talks.find((t) => t.id === openId) || talks[0]

  function send(e) {
    e.preventDefault()
    if (!text.trim()) return
    sendMessage(talk.id, 'kaabag', text.trim())
    setText('')
  }
  return (
    <Shell role="kaabag" eyebrow="KAABAG / PEER TALKS" title="One-on-one peer talk" subtitle="Students are handed to you by the chatbot. Talk with them here.">
      {loading ? <Loading /> : talks.length === 0 ? <EmptyState title="No students are handed over yet">When a student chooses Peer talk, the conversation shows here.</EmptyState> : (
        <div className="two-col wide-right">
          <ul className="card mail-list" aria-label="Conversations">
            {talks.map((t) => <li key={t.id}><button className={`mail-item${talk.id === t.id ? ' active' : ''}`} onClick={() => setOpenId(t.id)}><strong>{fullName(byId(t.studentId))}</strong><small>{t.status}</small></button></li>)}
          </ul>
          <section className="card chat">
            <header className="chat-head"><div><strong>{fullName(byId(talk.studentId))}</strong><small>Peer talk</small></div><StatusBadge status={talk.status === 'ongoing' ? 'active' : 'inactive'} /></header>
            <div className="chat-body">
              {talk.messages.length === 0 && <EmptyState title="No messages yet">Send the first message.</EmptyState>}
              {talk.messages.map((m) => <div key={m.id} className={`bubble ${m.from === 'kaabag' ? 'you' : 'bot'}`}><small>{m.from === 'kaabag' ? 'You' : 'Student'} · {m.at}</small><p>{m.text}</p></div>)}
            </div>
            {talk.status === 'ongoing' ? (
              <>
                <form className="composer" onSubmit={send}><label className="sr" htmlFor="m">Message</label><input id="m" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message" /><button className="btn" type="submit" disabled={!text.trim()}>Send</button></form>
                <div className="row pad">
                  <button className="btn btn-ghost" disabled={talk.asked} onClick={() => askCounseling(talk.id)}>Ask: Do you want counseling?</button>
                  <button className="btn" disabled={talk.wantsCounseling !== false} onClick={() => endTalk(talk.id)}>End conversation</button>
                </div>
                {talk.asked && talk.wantsCounseling === null && <Notice title="Waiting for the student’s answer" />}
                {talk.wantsCounseling === false && <Notice title="The student does not want counseling">You can end the conversation. No booking is started.</Notice>}
              </>
            ) : <Notice title="Conversation ended">{talk.wantsCounseling ? 'The student wants counseling and was reconnected to the chatbot to book.' : 'The conversation is closed.'}</Notice>}
          </section>
        </div>
      )}
    </Shell>
  )
}
