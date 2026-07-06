import axios from 'axios'
import { useState } from 'react'
import { useAuth } from '../../context/authContext'
import * as FaIcons from 'react-icons/fa'

function AdminPaths() {
  const { user } = useAuth()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [pathIcon, setPathIcon] = useState<File | null>(null);
  const handleSubmit = async () => {
    try {
      const paths = await axios.post("/mathly/paths", { title, description, path_icon: pathIcon },
        {
          headers: {
            Authorization: `Bearer ${user}`,
          },
        }
      )
      console.log(paths);

    } catch (error) {
      console.log(error);

    }
  }
  return (
    <div>
      <h1>Manage paths</h1>
      <input className='border' type='text' onChange={(e) => setTitle(e.target.value)} placeholder='title'></input>
      <input className='border' type='text' onChange={(e) => setDescription(e.target.value)} placeholder='desc'></input>
      <input type='file' onChange={(e) => setPathIcon(e.target?.files?.[0] || null)} placeholder='icon'></input>
      <button className='border' onClick={handleSubmit}>submit</button>
    </div>
  )
}

export default AdminPaths
