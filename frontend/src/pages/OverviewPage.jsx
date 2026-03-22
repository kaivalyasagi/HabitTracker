import { useState, useEffect } from 'react'
import { format, subDays, addDays, startOfMonth, parseISO } from 'date-fns'
import api from '../api/client'
import toast from 'react-hot-toast'

const VIEWS = ['daily','weekly','monthly','yearly']

function HeatmapGrid({ data }) {
  const weeks = data.reduce((acc, cell, i) => {
    const wi  = Math.floor(i / 7)
    acc[wi]   = acc[wi] || []
    acc[wi].push(cell)
    return acc
  }, [])

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((cell, di) => (
              <div key={di}
                title={`${cell.date}: ${cell.count} check-in${cell.count !== 1 ? 's' : ''}`}
                className={`w-3 h-3 rounded-sm heatmap-cell-${cell.level} cursor-default hover:scale-125 transition-transform`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function OverviewPage() {
  const [view,      setView]      = useState('daily')
  const [analytics, setAnalytics] = useState(null)
  const [habits,    setHabits]    = useState([])
  const [checkins,  setCheckins]  = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [aRes, hRes] = await Promise.all([api.get('/api/analytics'), api.get('/api/habits')])
        setAnalytics(aRes.data)
        setHabits(hRes.data)
        const start = format(subDays(new Date(), 89), 'yyyy-MM-dd')
        const end   = format(new Date(), 'yyyy-MM-dd')
        const cRes  = await api.get(`/api/checkins/range?start=${start}&end=${end}`)
        setCheckins(cRes.data)
      } catch { toast.error('Could not load overview') }
      finally   { setLoading(false) }
    }
    load()
  }, [])

  if (loading) return <div className="flex items-center justify-center min-h-screen text-4xl animate-bounce">🌸</div>

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="font-display text-3xl text-text-primary mb-2">Overview</h1>
      <p className="text-text-light text-sm mb-8">Your habit journey at a glance</p>

      <div className="flex bg-blush-light rounded-2xl p-1 w-fit mb-8">
        {VIEWS.map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`px-5 py-2 rounded-xl text-sm font-medium capitalize transition-all ${view === v ? 'bg-white text-rose shadow-soft' : 'text-text-muted'}`}
          >{v}</button>
        ))}
      </div>

      {/* Year heatmap — always visible */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg">Year in Pixels</h2>
          <div className="flex items-center gap-2 text-xs text-text-light">
            <span>Less</span>
            {[0,1,2,3,4].map(l => <div key={l} className={`w-3 h-3 rounded-sm heatmap-cell-${l}`} />)}
            <span>More</span>
          </div>
        </div>
        {analytics?.heatmap_data && <HeatmapGrid data={analytics.heatmap_data} />}
      </div>

      {/* Daily */}
      {view === 'daily' && (
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-display text-lg">Last 7 Days</h2>
            <div className="flex gap-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="w-7 text-center text-[10px] text-text-light font-medium">
                  {format(subDays(new Date(), 6 - i), 'EEE')[0]}
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {habits.map(h => (
              <div key={h.id} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: h.color }}>{h.icon}</div>
                <span className="text-sm font-medium flex-1 truncate">{h.name}</span>
                <div className="flex gap-1">
                  {Array.from({ length: 7 }).map((_, i) => {
                    const d    = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd')
                    const done = checkins.find(c => c.habit_id === h.id && c.date === d && c.completed)
                    return (
                      <div key={i}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${done ? 'text-white' : 'bg-blush-light text-text-light'}`}
                        style={done ? { background: h.color } : {}}>
                        {done ? '✓' : ''}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly */}
      {view === 'weekly' && (
        <div className="card mb-6">
          <h2 className="font-display text-lg mb-4">Weekly Summary</h2>
          <div className="grid grid-cols-4 gap-4">
            {[3,2,1,0].map(w => {
              const end   = subDays(new Date(), w * 7)
              const start = subDays(end, 6)
              const count = checkins.filter(c => {
                const d = parseISO(c.date)
                return c.completed && d >= start && d <= end
              }).length
              return (
                <div key={w} className="bg-blush-light rounded-2xl p-4 text-center">
                  <p className="text-xs text-text-light mb-1">{w === 0 ? 'This week' : w === 1 ? 'Last week' : format(start,'MMM d')}</p>
                  <p className="font-display text-2xl text-rose">{count}</p>
                  <p className="text-xs text-text-muted">check-ins</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Monthly */}
      {view === 'monthly' && (
        <div className="card mb-6">
          <h2 className="font-display text-lg mb-4">{format(new Date(), 'MMMM yyyy')}</h2>
          <div className="grid grid-cols-7 gap-1">
            {['M','T','W','T','F','S','S'].map((d,i) => (
              <div key={i} className="text-center text-xs text-text-light py-1 font-medium">{d}</div>
            ))}
            {Array.from({ length: 35 }).map((_, i) => {
              const monthStart = startOfMonth(new Date())
              const startDow   = (monthStart.getDay() + 6) % 7
              const cellDate   = addDays(monthStart, i - startDow)
              const inMonth    = cellDate.getMonth() === new Date().getMonth()
              const ds         = format(cellDate, 'yyyy-MM-dd')
              const count      = checkins.filter(c => c.date === ds && c.completed).length
              return (
                <div key={i}
                  className={`aspect-square rounded-xl flex items-center justify-center text-[10px] relative ${inMonth ? '' : 'opacity-30'}`}
                  style={{ background: count > 0 ? '#FADADD' : '#FFF0F2', color: count > 0 ? '#C03050' : '#B09090' }}>
                  {format(cellDate, 'd')}
                  {count > 0 && <span className="absolute bottom-0.5 right-0.5 text-[8px]">✓</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Stats */}
      {analytics && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label:'Current streak', value:`${analytics.current_streak}d`, icon:'🔥' },
            { label:'Longest streak', value:`${analytics.longest_streak}d`, icon:'⚡' },
            { label:'This month',     value:analytics.checkins_this_month,  icon:'📅' },
          ].map(s => (
            <div key={s.label} className="card text-center py-5">
              <div className="text-2xl mb-1">{s.icon}</div>
              <p className="font-display text-2xl text-rose mb-1">{s.value}</p>
              <p className="text-xs text-text-light">{s.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
