import { useParams } from 'react-router-dom'

function TopicChallenges() {
  const { topicId } = useParams()

  return (
    <div>
      <h1>Challenges for topic {topicId}</h1>
    </div>
  )
}

export default TopicChallenges
