import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import api from '../api/client'
import toast from 'react-hot-toast'

const COLORS = ['#E5637A','#9B87D5','#3BAF7E','#5BA4D4','#E5874A','#D4536A','#2A9E7A','#E57090']

export default function AnalyticsPage() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/analytics')
      .then(r => setData(r.data))
      .catch(() => toast.error('Could not load analytics'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center min-h-screen text-4xl animate-bounce">🌸</div>
  if (!data)   return null

  const pieData  = data.habit_breakdown.map(h => ({ name: h.name, value: h.completion_rate }))
  const barData  = data.habit_breakdown.map(h => ({ name: h.icon + ' ' + h.name.slice(0,10), rate: h.completion_rate }))
  const laziness = Math.max(0, 100 - data.overall_completion_rate)

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="font-display text-3xl text-text-primary mb-2">Analytics</h1>
      <p className="text-text-light text-sm mb-8">Understand your behavior patterns</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label:'Completion rate', value:`${data.overall_completion_rate}%`, icon:'✅' },
          { label:'Current streak',  value:`${data.current_streak}d`,          icon:'🔥' },
          { label:'Total check-ins', value:data.total_checkins,                icon:'📌' },
          { label:'Active habits',   value:data.active_habits,                 icon:'🌱' },
        ].map(s => (
          <div key={s.label} className="card text-center py-5">
            <div className="text-2xl mb-2">{s.icon}</div>
            <p className="font-display text-2xl mb-1">{s.value}</p>
            <p className="text-xs text-text-light">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h2 className="font-display text-lg mb-4">Habit Mix</h2>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => `${v}%`} contentStyle={{ borderRadius:12, border:'1px solid #FADADD', fontSize:12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1.5 mt-3">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-text-muted">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="flex-1 truncate">{d.name}</span>
                    <span className="font-medium text-text-primary">{d.value}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : <p className="text-text-light text-sm text-center py-8">No habits yet 🌱</p>}
        </div>

        <div className="card flex flex-col items-center justify-center">
          <h2 className="font-display text-lg mb-6">Consistency</h2>
          <div className="relative w-36 h-36">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#FFF0F2" strokeWidth="10" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#FF8FAB" strokeWidth="10"
                strokeDasharray={`${data.overall_completion_rate * 2.513} 251.3`}
                strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="font-display text-3xl text-rose">{data.overall_completion_rate}%</p>
              <p className="text-xs text-text-light">overall</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 w-full">
            <div className="bg-blush-light rounded-2xl p-3 text-center">
              <p className="text-xs text-text-light mb-1">Longest streak</p>
              <p className="font-display text-xl">{data.longest_streak}d</p>
            </div>
            <div className="bg-peach-light rounded-2xl p-3 text-center">
              <p className="text-xs text-text-light mb-1">This week</p>
              <p className="font-display text-xl">{data.checkins_this_week}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="font-display text-lg mb-4">Per-Habit Rate</h2>
        {barData.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} margin={{ top:0, right:0, left:-20, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#FFF0F2" />
              <XAxis dataKey="name" tick={{ fontSize:10, fill:'#B09090' }} />
              <YAxis tick={{ fontSize:10, fill:'#B09090' }} domain={[0,100]} />
              <Tooltip contentStyle={{ borderRadius:12, border:'1px solid #FADADD', fontSize:12 }} />
              <Bar dataKey="rate" name="Completion %" radius={[6,6,0,0]}>
                {barData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : <p className="text-text-light text-sm text-center py-8">No habits yet 🌱</p>}
      </div>

      <div className="card bg-lavender-light border border-lavender-dark/20">
        <div className="flex items-center gap-4">
          <div className="text-3xl">😴</div>
          <div className="flex-1">
            <h2 className="font-display text-base mb-1">Missed days trend</h2>
            <p className="text-xs text-text-muted mb-2">Lower is better — keep showing up!</p>
            <div className="h-2 bg-white/70 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-lavender-dark transition-all duration-700" style={{ width:`${laziness}%` }} />
            </div>
          </div>
          <div className="text-right">
            <p className="font-display text-2xl text-lavender-dark">{laziness.toFixed(1)}%</p>
            <p className="text-xs text-text-light">missed</p>
          </div>
        </div>
      </div>
    </div>
  )
}
