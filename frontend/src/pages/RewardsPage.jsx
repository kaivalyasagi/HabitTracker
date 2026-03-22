import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import api from '../api/client'
import toast from 'react-hot-toast'

const ALL_MILESTONES = [
  { days:7,   title:'7-Day Streak 🌟',   desc:'Keep going for a full week!'  },
  { days:14,  title:'2-Week Warrior 💪', desc:'14 days of consistency!'      },
  { days:21,  title:'21-Day Champion 🏆',desc:'You built a real habit!'      },
  { days:30,  title:'30-Day Legend 🔥',  desc:'A whole month of dedication!' },
  { days:50,  title:'50-Day Titan ⚡',   desc:'Halfway to 100 days!'         },
  { days:75,  title:'75 Days Strong 💎', desc:'75 Hard complete!'            },
  { days:100, title:'Century Club 🎯',   desc:'100 days of pure discipline!' },
]

export default function RewardsPage() {
  const [rewards,   setRewards]   = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([api.get('/api/rewards'), api.get('/api/analytics')])
      .then(([r, a]) => { setRewards(r.data); setAnalytics(a.data) })
      .catch(() => toast.error('Could not load rewards'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center min-h-screen text-4xl animate-bounce">🌸</div>

  const earned = new Set(rewards.map(r => r.title))
  const streak = analytics?.current_streak || 0

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="font-display text-3xl text-text-primary mb-2">Rewards</h1>
      <p className="text-text-light text-sm mb-8">Celebrate your consistency</p>

      <div className="card bg-gradient-to-br from-blush to-lavender-light mb-8 text-center py-10">
        <div className="text-6xl mb-3">🔥</div>
        <p className="font-display text-5xl text-rose mb-2">{streak}</p>
        <p className="text-text-muted text-sm">day streak — keep it going!</p>
        {streak === 0 && <p className="text-text-light text-xs mt-2">Check in today to start your streak</p>}
      </div>

      {rewards.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display text-xl mb-4">Earned Badges</h2>
          <div className="flex flex-col gap-3">
            {rewards.map(r => (
              <div key={r.id} className="bg-white rounded-3xl shadow-soft p-5 flex items-center gap-4">
                <div className="text-4xl">{r.badge_icon}</div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{r.title}</p>
                  <p className="text-xs text-text-muted">{r.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] bg-mint-light text-mint-dark px-2 py-0.5 rounded-full">Earned!</span>
                  <p className="text-[10px] text-text-light mt-1">{format(new Date(r.earned_at), 'MMM d, yyyy')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="font-display text-xl mb-4">All Milestones</h2>
        <div className="flex flex-col gap-3">
          {ALL_MILESTONES.map(m => {
            const isEarned = earned.has(m.title)
            const progress = Math.min(100, (streak / m.days) * 100)
            const daysLeft = Math.max(0, m.days - streak)
            return (
              <div key={m.days} className={`rounded-3xl p-5 flex items-center gap-4 ${isEarned ? 'bg-white shadow-card' : 'bg-blush-light/50'}`}>
                <div className={`text-3xl ${isEarned ? '' : 'grayscale opacity-40'}`}>
                  {m.title.split(' ').at(-1)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className={`text-sm font-medium ${isEarned ? 'text-text-primary' : 'text-text-muted'}`}>{m.title}</p>
                    {isEarned
                      ? <span className="text-[10px] bg-mint-light text-mint-dark px-2 py-0.5 rounded-full">✓ Earned</span>
                      : <span className="text-[10px] text-text-light">{daysLeft}d to go</span>
                    }
                  </div>
                  <div className="h-1.5 bg-blush rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-rose transition-all duration-700" style={{ width:`${progress}%` }} />
                  </div>
                  <p className="text-[10px] text-text-light mt-1">{m.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-10 text-center">
        <p className="text-text-light text-sm italic font-display">"Small habits, big life. Keep blooming. 🌸"</p>
      </div>
    </div>
  )
}
