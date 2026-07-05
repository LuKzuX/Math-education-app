import axios from "axios"
import { useState } from "react"
import { useSearchParams } from 'react-router-dom'

function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [newPassword, setNewPassword] = useState('')
  const handleSubmit = async () => {
    try {
      const res = await axios.post(
        '/mathly/reset-password',
        { newPassword },
        { params: { token } }
      )
      console.log(res)
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <div>
      <h1>Reset password</h1>
      <input
        className="border"
        type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}>
      </input>
      <button className="border" onClick={handleSubmit}>submit</button>
    </div>
  )
}

export default ResetPassword
