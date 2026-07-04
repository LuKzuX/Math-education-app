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
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-100 to-emerald-300 px-4'>
      <form
        className='
        w-full max-w-sm
        bg-white/80 backdrop-blur-md 
        rounded-2xl 
        shadow-xl 
        border border-white/40
        p-8
        flex flex-col gap-6
      '
      >
        <h1 className='text-3xl font-semibold text-gray-800 text-center'>
          Sign In
        </h1>

        {/* Email */}
        <div className='flex flex-col gap-1'>
          <input
            type='text'
            onChange={(e) => setEmail(e.target.value)}
            placeholder='E-mail'
            className='
            w-full
            border-b-2 border-gray-300 
            focus:border-emerald-500 
            focus:outline-none
            bg-transparent
            py-2 text-lg
            transition-all
          '
          />
        </div>

        {/* Password */}
        <div className='flex flex-col gap-1'>
          <input
            type='password'
            onChange={(e) => setPassword(e.target.value)}
            placeholder='Password'
            className='
            w-full
            border-b-2 border-gray-300 
            focus:border-emerald-500 
            focus:outline-none
            bg-transparent
            py-2 text-lg
            transition-all
          '
          />
        </div>

        {/* Buttons */}
        <div className='flex flex-col items-center gap-3 pt-4'>
          <button
            onClick={handleSubmit}
            disabled={!email || !password}
            className={`
    w-full py-3
    text-white text-lg font-medium
    rounded-xl shadow-md
    transition-all
    active:scale-95
    ${!email || !password
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700'
              }
  `}
          >
            Sign In
          </button>

          <button
            onClick={() => navigation('/signup')}
            type='button'
            className='
            text-emerald-700 
            underline text-base font-medium
            hover:text-emerald-900 transition-all
          '
          >
            Sign Up
          </button>
          <button
            type='button'
            onClick={() => navigation('/')}
            className='
    mt-2
    text-sm
    font-medium
    text-emerald-600
    hover:text-emerald-700
    hover:underline
    transition-colors
    focus:outline-none
    focus:ring-2
    focus:ring-emerald-500
    focus:ring-offset-2
    rounded
  '
          >
            Forgot your password?
          </button>
        </div>
        <div className=''>
        </div>
      </form>
    </div>
  )
}

export default Signin
