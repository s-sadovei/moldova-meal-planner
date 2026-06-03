import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Auth() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode') || 'login'
  const { login, signup } = useApp()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email || !password) { setError('Please fill in all fields.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (mode === 'signup' && password !== confirm) { setError('Passwords do not match.'); return }

    setLoading(true)
    setError('')

    try {
      if (mode === 'signup') {
        await signup(email, password)
        navigate('/setup')
      } else {
        await login(email, password)
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-white border-[1.5px] border-[#E8E6E0] rounded-[14px] px-4 py-4 text-[14px] font-medium text-[#2C2C2A] outline-none focus:border-[#2D5A27]"
  const labelClass = "text-[12px] font-semibold text-[#5F5E5A] uppercase tracking-[0.8px]"

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col">

      <div className="bg-[#2D5A27] px-7 pt-14 pb-8 flex flex-col gap-3">
        <button onClick={() => navigate('/')}
          className="self-start text-[#9FE1CB] text-[13px] font-medium flex items-center gap-1 mb-2">
          ← Back
        </button>
        <h1 style={{ fontFamily: "'Playfair Display', serif" }}
          className="text-white text-[38px] font-extrabold leading-[1.1] whitespace-pre-line">
          {mode === 'signup' ? 'Create\naccount.' : 'Welcome\nback.'}
        </h1>
        <p className="text-[#9FE1CB] text-[14px] font-medium leading-relaxed">
          {mode === 'signup' ? 'Start your meal planning journey today.' : 'Log in to see your meal plan.'}
        </p>
      </div>

      <div className="bg-[#2D5A27] h-7" style={{ clipPath: 'ellipse(110% 100% at 50% 0%)' }} />

      <div className="flex-1 px-6 py-6 flex flex-col gap-4">

        <div className="flex flex-col gap-2">
          <label className={labelClass}>Email</label>
          <input className={inputClass} type="email" placeholder="you@example.com"
            value={email} onChange={e => setEmail(e.target.value)} />
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClass}>Password</label>
          <input className={inputClass} type="password" placeholder="Min. 6 characters"
            value={password} onChange={e => setPassword(e.target.value)} />
        </div>

        {mode === 'signup' && (
          <div className="flex flex-col gap-2">
            <label className={labelClass}>Confirm password</label>
            <input className={inputClass} type="password" placeholder="Repeat your password"
              value={confirm} onChange={e => setConfirm(e.target.value)} />
          </div>
        )}

        {mode === 'login' && (
          <p className="text-right text-[12px] text-[#2D5A27] font-semibold">Forgot password?</p>
        )}

        {error && <p className="text-red-500 text-[13px] font-medium">{error}</p>}

        <button onClick={handleSubmit} disabled={loading}
          className="w-full bg-[#2D5A27] text-white font-semibold text-[15px] py-4 rounded-2xl mt-2 disabled:opacity-60">
          {loading ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Log In'}
        </button>

        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-[#E8E6E0]" />
          <span className="text-[#B4B2A9] text-[12px]">or continue with</span>
          <div className="flex-1 h-px bg-[#E8E6E0]" />
        </div>

        <button className="w-full bg-white border-[1.5px] border-[#E8E6E0] text-[#2C2C2A] font-semibold text-[14px] py-4 rounded-2xl flex items-center justify-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {mode === 'signup' && (
          <p className="text-[11px] text-[#B4B2A9] text-center leading-relaxed">
            By signing up you agree to our{' '}
            <span className="text-[#2D5A27] font-semibold">Terms</span> and{' '}
            <span className="text-[#2D5A27] font-semibold">Privacy Policy</span>
          </p>
        )}

        <p className="text-[13px] text-[#888780] text-center font-medium mt-1">
          {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
          <button
            onClick={() => navigate(mode === 'signup' ? '/auth?mode=login' : '/auth?mode=signup')}
            className="text-[#2D5A27] font-semibold">
            {mode === 'signup' ? 'Log in' : 'Sign up'}
          </button>
        </p>

      </div>
    </div>
  )
}