import { useParams } from 'react-router-dom'

function AdminTopics() {
  const { pathId } = useParams()

  return (
    <div>
      <h1>Manage topics for path {pathId}</h1>
    </div>
  )
}

export default AdminTopics
