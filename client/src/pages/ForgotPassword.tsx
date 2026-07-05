import axios from "axios"
import { useState } from "react"

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const handleSubmit = async () => {
    try {
      const res = await axios.post('/mathly/forgot-password', { email })
      setMessage(res.data.message)
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <div>
      <h1>Forgot password</h1>
      <input
        className="border"
        type="email" value={email} onChange={(e) => setEmail(e.target.value)}>
      </input>
      <button className="border" onClick={handleSubmit}>submit</button>
      {message && <p>{message}</p>}
    </div>
  )
}

export default ForgotPassword
