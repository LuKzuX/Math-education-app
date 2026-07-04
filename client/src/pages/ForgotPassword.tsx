import axios from "axios"
import { useState } from "react"

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const handleSubmit = async () => {
    try {
      const res = await axios.post('/mathly/forgot-password', { email })
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <div>
      <h1>Forgot password</h1>
      <input
        className="border"
        type="text" value={email} onChange={(e) => setEmail(e.target.value)}>
      </input>
      <button onClick={handleSubmit}>submit</button>
    </div>
  )
}

export default ForgotPassword
