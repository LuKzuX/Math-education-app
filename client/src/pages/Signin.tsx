import { useAuth } from "../context/authContext"
import { useNavigate } from 'react-router-dom'
import { useState } from "react"

function Signin() {
  const { login } = useAuth()
  const navigation = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    try {
      await login(email, password)
      navigation('/')
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <div>
      <form>
        <h1>
          Sign In
        </h1>

        {/* Email */}
        <div>
          <input
            type='text'
            onChange={(e) => setEmail(e.target.value)}
            placeholder='E-mail'
          />
        </div>

        {/* Password */}
        <div>
          <input
            type='password'
            onChange={(e) => setPassword(e.target.value)}
            placeholder='Password'
          />
        </div>

        {/* Buttons */}
        <div>
          <button
            className="border"
            onClick={handleSubmit}
            disabled={!email || !password}
          >
            Sign In
          </button>

          <button
            className="border"
            onClick={() => navigation('/signup')}
            type='button'
          >
            Sign Up
          </button>
          <button
            className="border"
            type='button'
            onClick={() => navigation('/forgot-password')}
          >
            Forgot your password?
          </button>
        </div>
        <div>
        </div>
      </form>
    </div>
  )
}

export default Signin
