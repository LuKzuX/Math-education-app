import { useParams } from 'react-router-dom'

function AdminChallenges() {
  const { topicId } = useParams()

  return (
    <div>
      <h1>Manage challenges for topic {topicId}</h1>
    </div>
  )
}

export default AdminChallenges
