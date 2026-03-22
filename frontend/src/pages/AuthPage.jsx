import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import toast from 'react-hot-toast'

export default function AuthPage() {
  const [mode, setMode]       = useState('login')
  const [form, setForm]       = useState({ email:'', username:'', password:'' })
  const [loading, setLoading] = useState(false)
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login'
      const payload  = mode === 'signup'
        ? { email: form.email, username: form.username, password: form.password }
        : { email: form.email, password: form.password }
      const { data } = await api.post(endpoint, payload)
      login(data)
      toast.success(mode === 'signup' ? 'Welcome to Bloom! 🌸' : 'Welcome back! ✨')
      navigate(data.onboarding_completed ? '/' : '/onboarding')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blush-light via-lavender-light to-mint-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-5xl text-rose mb-2">Bloom</h1>
          <p className="text-text-muted text-sm">grow your habits, grow yourself</p>
        </div>

        <div className="card">
          <div className="flex bg-blush-light rounded-2xl p-1 mb-8">
            {['login','signup'].map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  mode === m ? 'bg-white text-rose shadow-soft' : 'text-text-muted'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'signup' && (
              <div>
                <label className="label">Username</label>
                <input className="input" placeholder="your name" value={form.username} onChange={set('username')} required />
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="hello@email.com" value={form.email} onChange={set('email')} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? '...' : mode === 'login' ? 'Sign In ✨' : 'Create Account 🌸'}
            </button>
          </form>

          <p className="text-center text-xs text-text-light mt-6">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-rose hover:underline">
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
