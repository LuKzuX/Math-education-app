import { useAuth } from "../context/authContext"
import { useNavigate } from 'react-router-dom'
import { useState } from "react"

function Signup() {
  const navigation = useNavigate()
  const { signup } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    try {
      await signup(username, email, password)
      navigation('/')
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <div>
      <form>
        <h1>
          Sign up
        </h1>

        {/* Username */}
        <div>
          <input
            type='text'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder='Username'
          />
        </div>

        {/* Email */}
        <div>
          <input
            type='text'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='E-mail'
          />
        </div>

        {/* Password */}
        <div>
          <input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='Password'
          />
        </div>

        {/* Buttons */}
        <div>
          <button
            className="border"
            onClick={handleSubmit}
            disabled={!username || !email || !password}
          >
            Sign up
          </button>

          <button
            className="border"
            type='button'
            onClick={() => navigation('/signin')}
          >
            Already have an account?
          </button>
        </div>
      </form>
    </div>
  )
}

export default Signup
