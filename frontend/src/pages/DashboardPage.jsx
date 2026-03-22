import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import toast from 'react-hot-toast'
import HabitCard     from '../components/HabitCard'
import AddHabitModal from '../components/AddHabitModal'

const LABEL    = d => ({ 7:'1-Week',14:'2-Week',21:'21-Day',30:'30-Day',50:'50-Day',75:'75-Day',100:'100-Day' }[d] || `${d}-Day`)
const GREETING = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening' }

export default function DashboardPage() {
  const { user } = useAuth()
  const [habits,    setHabits]    = useState([])
  const [checkins,  setCheckins]  = useState([])
  const [showModal, setShowModal] = useState(false)
  const [loading,   setLoading]   = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [hRes, cRes] = await Promise.all([
        api.get('/api/habits'),
        api.get('/api/checkins/today'),
      ])
      setHabits(hRes.data)
      setCheckins(cRes.data)
    } catch { toast.error('Could not load habits') }
    finally   { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleToggle = async (habitId, completed) => {
    const today    = new Date().toISOString().split('T')[0]
    const { data } = await api.post('/api/checkins', { habit_id: habitId, date: today, completed })
    setCheckins(prev => [...prev.filter(c => !(c.habit_id === habitId && c.date === today)), data])
    if (completed) {
      const h = habits.find(h => h.id === habitId)
      toast.success(`${h?.icon} ${h?.name} done! ✨`)
    }
    fetchData()
  }

  const today     = new Date().toISOString().split('T')[0]
  const todayDone = checkins.filter(c => c.date === today && c.completed).length
  const allDone   = habits.length > 0 && todayDone === habits.length

  const groups = habits.reduce((acc, h) => {
    const key = String(h.duration_days)
    acc[key]  = acc[key] ? [...acc[key], h] : [h]
    return acc
  }, {})

  if (loading) return <div className="flex items-center justify-center min-h-screen text-4xl animate-bounce">🌸</div>

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <p className="text-text-light text-sm mb-1">
          {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}
        </p>
        <h1 className="font-display text-3xl text-text-primary">{GREETING()}, {user?.username} 🌸</h1>
        {allDone && (
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-mint-light rounded-2xl text-mint-dark text-sm font-medium">
            🎉 All habits done today!
          </div>
        )}
      </div>

      {habits.length > 0 && (
        <div className="card mb-6 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-muted">Today's progress</span>
            <span className="text-sm font-medium text-rose">{todayDone} / {habits.length}</span>
          </div>
          <div className="h-2 bg-blush-light rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose to-blush-dark transition-all duration-700"
              style={{ width: `${habits.length ? (todayDone / habits.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {Object.keys(groups).length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🌱</div>
          <h2 className="font-display text-2xl mb-2">Your garden is empty</h2>
          <p className="text-text-light text-sm mb-6">Add your first habit to start blooming</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">+ Add First Habit</button>
        </div>
      ) : (
        Object.entries(groups).sort(([a],[b]) => parseInt(a) - parseInt(b)).map(([days, group]) => (
          <div key={days} className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-lg">🎯</span>
              <h2 className="font-display text-lg text-text-primary">{LABEL(parseInt(days))} Challenge</h2>
              <div className="flex-1 h-px bg-blush" />
              <span className="text-xs text-text-light">{group.length} habit{group.length > 1 ? 's' : ''}</span>
            </div>
            <div className="flex flex-col gap-3">
              {group.map(h => <HabitCard key={h.id} habit={h} checkins={checkins} onToggle={handleToggle} />)}
            </div>
          </div>
        ))
      )}

      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-rose text-white rounded-full shadow-float text-2xl flex items-center justify-center hover:bg-rose-dark active:scale-95 transition-all"
      >+</button>

      {showModal && <AddHabitModal onClose={() => setShowModal(false)} onAdded={h => setHabits(p => [...p, h])} />}
    </div>
  )
}
