import { createContext, useContext, useState, type ReactNode } from 'react'
import axios from 'axios'

interface User {
    id: string
    email: string
    username?: string
    is_admin?: boolean
}

interface AuthContextType {
    user: User | null
    error: string | null
    login: (email: string, password: string) => Promise<void>
    logout: () => void
    signup: (username: string, email: string, password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(() => {
        const stored = localStorage.getItem('user')
        return stored ? JSON.parse(stored) : null
    })
    const [error, setError] = useState<string | null>(null)

    const login = async (email: string, password: string) => {
        try {
            const response = await axios.post('/mathly/signin', { email, password })
            localStorage.setItem('token', response.data.token)
            localStorage.setItem('user', JSON.stringify(response.data.user))
            setUser(response.data.user)
            setError(null)
        } catch (err) {
            const message = axios.isAxiosError(err)
                ? err.response?.data?.message ?? 'Something went wrong'
                : 'Something went wrong'
            setError(message)
            throw err
        }
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
    }

    const signup = async (
        username: string,
        email: string,
        password: string,
    ) => {
        try {
            const response = await axios.post('/mathly/signup', {
                username,
                email,
                password,
            })
            console.log('Signup successful:', response.data)
        } catch (err) {
            const message = axios.isAxiosError(err)
                ? err.response?.data?.message ?? 'Something went wrong'
                : 'Something went wrong'
            setError(message)
            throw err
        }
    }

    return (
        <AuthContext.Provider value={{ user, error, login, logout, signup }}>
            {children}
        </AuthContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthContextProvider')
    }
    return context
}
