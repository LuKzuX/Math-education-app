import { useParams } from 'react-router-dom'

function PathTopics() {
  const { pathId } = useParams()

  return (
    <div>
      <h1>Topics for path {pathId}</h1>
    </div>
  )
}

export default PathTopics
