import { useParams } from 'react-router-dom'

function ChallengePlay() {
  const { challengeId } = useParams()

  return (
    <div>
      <h1>Challenge {challengeId}</h1>
    </div>
  )
}

export default ChallengePlay
