import { useEffect } from "react"
import axios from "axios"

function Achievements() {
  useEffect(() => {
    const getData = async () => {
      try {
        const data = await axios.get("/mathly/achievements")
        console.log(data.data);

      } catch (error) {
        console.log(error);

      }
    }
    getData()
  }, [])
  return (
    <div>
      <h1>Achievements</h1>
    </div>
  )
}

export default Achievements
