import { useState } from 'react'
import api from '../api/client'
import toast from 'react-hot-toast'

const COLORS    = ['#FADADD','#E6DEFF','#D4F5E9','#D6EEFF','#FFE5D0','#FFF3CD','#F9A8D4','#A8E8CE']
const ICONS     = ['✨','🏃','📚','💧','🧘','🍎','💪','🌙','✍️','🎯','🧠','🌿','☀️','🎨','🛏️']
const TIMES     = ['morning','afternoon','evening','anytime']
const TYPES     = [{ v:'boolean',l:'Check-off' },{ v:'count',l:'Count' },{ v:'duration',l:'Duration (mins)' }]
const DURATIONS = [7,14,21,30,50,75,100]

export default function AddHabitModal({ onClose, onAdded }) {
  const [form, setForm] = useState({
    name:'', habit_type:'boolean', frequency:'daily',
    target_value:'', target_unit:'', preferred_time:'anytime',
    duration_days:21, color:'#FADADD', icon:'✨',
  })
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Give your habit a name!')
    setLoading(true)
    try {
      const { data } = await api.post('/api/habits', {
        ...form,
        target_value: form.target_value ? parseFloat(form.target_value) : null,
      })
      toast.success(`"${data.name}" added! 🌸`)
      onAdded(data)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not add habit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-float w-full max-w-md max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl text-text-primary">New Habit</h2>
          <button onClick={onClose} className="text-text-light hover:text-text-primary text-2xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="label">Habit name</label>
            <input className="input" placeholder="e.g. Drink 2L water" value={form.name} onChange={set('name')} />
          </div>

          <div>
            <label className="label">Icon</label>
            <div className="flex flex-wrap gap-1.5">
              {ICONS.map(ic => (
                <button key={ic} type="button"
                  onClick={() => setForm(f => ({ ...f, icon: ic }))}
                  className={`w-9 h-9 rounded-xl text-base transition-all ${form.icon === ic ? 'bg-blush ring-2 ring-rose/40' : 'bg-blush-light hover:bg-blush'}`}
                >{ic}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Color</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c} type="button"
                  onClick={() => setForm(f => ({ ...f, color: c }))}
                  style={{ background: c }}
                  className={`w-8 h-8 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-rose/50 scale-110' : 'hover:scale-105'}`}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.habit_type} onChange={set('habit_type')}>
                {TYPES.map(t => <option key={t.v} value={t.v}>{t.l}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Frequency</label>
              <select className="input" value={form.frequency} onChange={set('frequency')}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          {form.habit_type !== 'boolean' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Target</label>
                <input className="input" type="number" placeholder="e.g. 8" value={form.target_value} onChange={set('target_value')} />
              </div>
              <div>
                <label className="label">Unit</label>
                <input className="input" placeholder="glasses / mins" value={form.target_unit} onChange={set('target_unit')} />
              </div>
            </div>
          )}

          <div>
            <label className="label">Preferred time</label>
            <div className="flex gap-2">
              {TIMES.map(t => (
                <button key={t} type="button"
                  onClick={() => setForm(f => ({ ...f, preferred_time: t }))}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium capitalize transition-all ${
                    form.preferred_time === t
                      ? 'bg-blush text-rose border-2 border-rose/30'
                      : 'bg-blush-light text-text-muted border-2 border-transparent hover:bg-blush'
                  }`}
                >{t}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Challenge duration</label>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map(d => (
                <button key={d} type="button"
                  onClick={() => setForm(f => ({ ...f, duration_days: d }))}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                    form.duration_days === d
                      ? 'bg-blush text-rose border-2 border-rose/30'
                      : 'bg-blush-light text-text-muted border-2 border-transparent hover:bg-blush'
                  }`}
                >{d}d</button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary mt-2">
            {loading ? 'Adding...' : 'Add Habit 🌸'}
          </button>
        </form>
      </div>
    </div>
  )
}
