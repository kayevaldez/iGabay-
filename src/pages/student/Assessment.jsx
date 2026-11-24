import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Shell from '../../components/Shell'
import { Field, Notice, Stepper } from '../../components/ui'
import { useApp } from '../../state'

// FR-10, FR-11. The SRS says the approved assessment questions are still pending,
// so the items below are placeholders. Replace the text when the questions are approved.
const QUESTIONS = ['[Approved question text 1]', '[Approved question text 2]']

export default function Assessment() {
  const { user, saveAssessment } = useApp()
  const navigate = useNavigate()
  const [answers, setAnswers] = useState(QUESTIONS.map(() => ''))
  const [errors, setErrors] = useState([])

  function submit(e) {
    e.preventDefault()
    const errs = answers.map((a) => (a.trim() ? '' : 'Please answer this question.'))
    setErrors(errs)
    if (errs.some(Boolean)) return
    saveAssessment(user.id, answers.map((a) => a.trim()))
    navigate('/student/appointment')
  }

  return (
    <Shell role="student" eyebrow="STUDENT / GUIDANCE REQUEST" title="Guidance request · Well-being assessment" subtitle="Your answers help the counselor prepare. They are not shown to other students.">
      <Stepper steps={['Well-being assessment', 'Appointment details', 'Review & submit']} current={1} />
      <Notice title="This assessment is not a clinical diagnosis">It is a baseline for your counseling session. The assessment questions are pending approval, so placeholders are shown.</Notice>
      <form className="card" onSubmit={submit} noValidate>
        {QUESTIONS.map((q, i) => (
          <Field key={q} id={`q${i}`} label={`${i + 1}. ${q}`} error={errors[i]}>
            <textarea id={`q${i}`} rows="3" placeholder="[Approved answer input]" value={answers[i]} onChange={(e) => setAnswers(answers.map((a, j) => (j === i ? e.target.value : a)))} />
          </Field>
        ))}
        <div className="row"><button className="btn" type="submit">Submit and continue</button><button type="button" className="btn btn-ghost" onClick={() => navigate('/student/support')}>Back to support options</button></div>
      </form>
    </Shell>
  )
}
