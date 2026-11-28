import { useEffect, useRef, useState } from 'react'
import { useApp } from '../../state'
import Shell from '../../components/Shell'
import Icon from '../../components/Icon'
import { EmptyState } from '../../components/ui'
import { fullName, initials } from '../../utils'

const EMERGENCY = <><b>Not suitable for emergencies</b> — Contact the guidance office or emergency services directly for urgent help.</>

// Kaabag screens: empty list (K00), chat with a student (K01), conversation ended (K04)
export default function Talks() {
  const { db, user, byId, sendMessage, askCounseling, endTalk, reconnectTalk } = useApp()
  const [picked, setPicked] = useState(null)
  const [text, setText] = useState('')
  const endRef = useRef(null)
  const talks = db.peerTalks.filter((t) => t.kaabagId === user.id).sort((a, b) => (a.status === b.status ? b.id - a.id : a.status === 'ongoing' ? -1 : 1))
  const talk = talks.find((t) => t.id === picked) || talks[0]
  const count = talk ? talk.messages.length : 0
  const talkId = talk ? talk.id : null
  useEffect(() => { if (endRef.current) endRef.current.scrollTop = endRef.current.scrollHeight }, [count, talkId])

  if (!talk) {
    return (
      <Shell role="kaabag">
        <div className="page">
          <div><p className="eyebrow">Peer talks</p><h1>Handed-over chats</h1></div>
          <EmptyState icon="chat" title="No peer talks right now">When a student chooses Peer talk, the chat will show here.</EmptyState>
        </div>
      </Shell>
    )
  }
  const student = byId(talk.studentId)
  const ongoing = talk.status === 'ongoing'
  const send = (e) => { e.preventDefault(); if (!text.trim() || !ongoing) return; sendMessage(talk.id, 'kaabag', text.trim()); setText('') }

  return (
    <Shell role="kaabag" bare>
      <div className="chat">
        <aside className="chat-list" aria-label="Peer talks">
          <h2>Peer talks</h2>
          {talks.map((t) => (
            <button key={t.id} className={`chat-item${t.id === talk.id ? ' on' : ''}`} onClick={() => setPicked(t.id)}>
              <span className="avatar grey">{initials(byId(t.studentId))}</span>
              <span><b>{fullName(byId(t.studentId))}</b><small>{t.status === 'ongoing' ? 'Handed over by the chatbot' : 'Conversation ended'}</small></span>
            </button>
          ))}
        </aside>
        <section className="chat-pane" aria-label="Conversation">
          <div className="chat-head">
            <span className="avatar grey">{initials(student)}</span>
            <div><b>{fullName(student)}</b><small className="muted">Student</small></div>
            {ongoing && (
              <div className="actions">
                <button className="btn btn-outline" onClick={() => askCounseling(talk.id)}>Ask about counseling</button>
                <button className="btn btn-outline" onClick={() => endTalk(talk.id)}>End conversation</button>
                <button className="btn" onClick={() => reconnectTalk(talk.id)}>Reconnect to chatbot to book</button>
              </div>
            )}
          </div>
          <div className="emerg">{EMERGENCY}</div>
          <div className="msgs" ref={endRef} aria-live="polite">
            {talk.messages.map((m) => m.from === 'system'
              ? <div className="sys" key={m.id}>{m.kaabag}</div>
              : m.from === 'kaabag'
                ? <div className="m me" key={m.id}><div className="col"><div className="bub me">{m.text}</div></div></div>
                : <div className="m" key={m.id}><span className="avatar sm grey" aria-hidden="true">{initials(student)}</span><div className="col"><div className="bub">{m.text}</div></div></div>)}
          </div>
          <form className="composer" onSubmit={send}>
            <input aria-label="Message" placeholder={ongoing ? 'Aa' : 'This conversation has ended'} disabled={!ongoing} value={text} onChange={(e) => setText(e.target.value)} />
            <button className="send" type="submit" aria-label="Send" disabled={!ongoing || !text.trim()}><Icon name="send" size={16} /></button>
          </form>
        </section>
      </div>
    </Shell>
  )
}
