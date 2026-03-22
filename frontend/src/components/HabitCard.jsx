import { useState } from 'react'

export default function HabitCard({ habit, checkins, onToggle }) {
  const [loading, setLoading] = useState(false)
  const today        = new Date().toISOString().split('T')[0]
  const todayCheckin = checkins.find(c => c.habit_id === habit.id && c.date === today)
  const done         = todayCheckin?.completed || false
  const progress     = Math.min(100, Math.round(habit.completion_rate || 0))
  const streak       = habit.current_streak || 0

  const handleToggle = async () => {
    setLoading(true)
    try { await onToggle(habit.id, !done) }
    finally { setLoading(false) }
  }

  return (
    <div
      className="bg-white rounded-3xl shadow-soft p-5 flex items-center gap-4 hover:shadow-card transition-all duration-200"
      style={{ borderLeft: `4px solid ${habit.color}` }}
    >
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg border-2 transition-all duration-300 ${
          done
            ? 'border-transparent text-white'
            : 'border-dashed border-text-light/40 hover:border-rose/50 bg-white'
        }`}
        style={done ? { background: habit.color } : {}}
      >
        {done ? '✓' : ''}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span>{habit.icon}</span>
          <span className={`font-medium text-sm ${done ? 'line-through text-text-light' : 'text-text-primary'}`}>
            {habit.name}
          </span>
          {habit.target_value && (
            <span className="text-[10px] bg-lavender-light text-lavender-dark px-2 py-0.5 rounded-full">
              {habit.target_value} {habit.target_unit}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-blush-light rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: habit.color }}
            />
          </div>
          <span className="text-[10px] text-text-light shrink-0">{progress}%</span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        {streak > 0 && (
          <span className="text-[10px] bg-peach-light text-amber-700 px-2 py-0.5 rounded-full">
            🔥 {streak}d
          </span>
        )}
        <span className="text-[10px] text-text-light">{habit.duration_days}d challenge</span>
        <span className="text-[10px] text-text-light capitalize">{habit.preferred_time}</span>
      </div>
    </div>
  )
}
