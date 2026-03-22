import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import toast from 'react-hot-toast'

const DOMAINS   = ['Fitness','Study','Health','Mindset','Discipline','Sleep','Nutrition','Creativity','Finance','Relationships']
const AREAS     = ['Body & Health','Mind & Learning','Career & Goals','Relationships','Inner Peace','Creativity','Finances','Habits & Routine']
const DURATIONS = [7,14,21,30,50,75,100]
const STEPS     = ['Welcome','Goals','Life Areas','Focus','Commitment']

export default function OnboardingPage() {
  const [step, setStep]       = useState(0)
  const [form, setForm]       = useState({ goals:'', life_areas:[], focus_domain:'', commitment_days:21 })
  const [loading, setLoading] = useState(false)
  const { completeOnboarding } = useAuth()
  const navigate = useNavigate()

  const toggleArea = area => setForm(f => ({
    ...f,
    life_areas: f.life_areas.includes(area)
      ? f.life_areas.filter(a => a !== area)
      : [...f.life_areas, area]
  }))

  const handleFinish = async () => {
    setLoading(true)
    try {
      await api.post('/api/onboarding', {
        goals:           form.goals.split('\n').filter(Boolean),
        life_areas:      form.life_areas,
        focus_domain:    form.focus_domain,
        commitment_days: form.commitment_days,
      })
      completeOnboarding()
      toast.success('Welcome to your bloom journey! 🌸')
      navigate('/')
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blush-light via-lavender-light to-mint-light flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="flex gap-2 mb-8 justify-center">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i <= step ? 'bg-rose w-8' : 'bg-blush w-4'}`} />
          ))}
        </div>

        <div className="card min-h-[420px] flex flex-col">
          {step === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
              <div className="text-6xl mb-2">🌸</div>
              <h2 className="font-display text-3xl">Welcome to Bloom</h2>
              <p className="text-text-muted text-sm max-w-xs leading-relaxed">
                Let's set up your habit garden. This takes just a minute.
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="flex-1 flex flex-col gap-4">
              <div>
                <h2 className="font-display text-2xl mb-1">What are your goals?</h2>
                <p className="text-text-light text-sm">One goal per line</p>
              </div>
              <textarea
                className="input resize-none flex-1 min-h-[200px]"
                placeholder={"Drink more water\nExercise daily\nRead 20 minutes"}
                value={form.goals}
                onChange={e => setForm(f => ({ ...f, goals: e.target.value }))}
              />
            </div>
          )}

          {step === 2 && (
            <div className="flex-1 flex flex-col gap-4">
              <div>
                <h2 className="font-display text-2xl mb-1">Areas to improve</h2>
                <p className="text-text-light text-sm">Select all that apply</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {AREAS.map(area => (
                  <button key={area} onClick={() => toggleArea(area)}
                    className={`py-3 px-4 rounded-2xl text-sm text-left transition-all ${
                      form.life_areas.includes(area)
                        ? 'bg-blush border-2 border-rose/40 text-rose-dark font-medium'
                        : 'bg-blush-light border-2 border-transparent text-text-muted hover:border-blush-dark'
                    }`}
                  >{area}</button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex-1 flex flex-col gap-4">
              <div>
                <h2 className="font-display text-2xl mb-1">Primary focus</h2>
                <p className="text-text-light text-sm">Pick one to prioritize</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {DOMAINS.map(d => (
                  <button key={d} onClick={() => setForm(f => ({ ...f, focus_domain: d }))}
                    className={`py-3 px-4 rounded-2xl text-sm transition-all ${
                      form.focus_domain === d
                        ? 'bg-blush border-2 border-rose/40 text-rose-dark font-medium'
                        : 'bg-blush-light border-2 border-transparent text-text-muted hover:border-blush-dark'
                    }`}
                  >{d}</button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex-1 flex flex-col gap-4">
              <div>
                <h2 className="font-display text-2xl mb-1">Your commitment</h2>
                <p className="text-text-light text-sm">How many days are you in for?</p>
              </div>
              <div className="flex flex-col gap-2">
                {DURATIONS.map(d => (
                  <button key={d} onClick={() => setForm(f => ({ ...f, commitment_days: d }))}
                    className={`flex items-center justify-between px-5 py-4 rounded-2xl text-sm transition-all ${
                      form.commitment_days === d
                        ? 'bg-blush border-2 border-rose/40 text-rose-dark font-medium'
                        : 'bg-blush-light border-2 border-transparent text-text-muted hover:border-blush-dark'
                    }`}
                  >
                    <span>{d} days</span>
                    <span className="text-xs text-text-light">
                      {d <= 7 ? '1 week' : d <= 14 ? '2 weeks' : d <= 21 ? '3 weeks' : d <= 30 ? '1 month' : `${d} day challenge`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6 pt-4 border-t border-blush">
            {step > 0 && <button onClick={() => setStep(s => s - 1)} className="btn-ghost flex-1">Back</button>}
            {step < STEPS.length - 1
              ? <button onClick={() => setStep(s => s + 1)} className="btn-primary flex-1">Continue →</button>
              : <button onClick={handleFinish} disabled={loading} className="btn-primary flex-1">
                  {loading ? 'Setting up...' : "Let's Bloom 🌸"}
                </button>
            }
          </div>
        </div>
      </div>
    </div>
  )
}
