import { useState } from 'react'
import CaseList from './components/CaseList'
import InterviewRoom from './components/InterviewRoom'

function App() {
  const [currentSession, setCurrentSession] = useState<string | null>(null)
  const [currentCaseId, setCurrentCaseId] = useState<string | null>(null)

  const handleStartInterview = (sessionId: string, caseId: string) => {
    setCurrentSession(sessionId)
    setCurrentCaseId(caseId)
  }

  const handleEndInterview = () => {
    setCurrentSession(null)
    setCurrentCaseId(null)
  }

  if (currentSession) {
    return (
      <InterviewRoom
        sessionId={currentSession}
        caseId={currentCaseId!}
        onEndInterview={handleEndInterview}
      />
    )
  }

  return <CaseList onStartInterview={handleStartInterview} />
}

export default App
