import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'

const TimerContext = createContext()

export function TimerProvider({ children }) {
  const [timers, setTimers] = useState({})
  const intervalRef = useRef(null)

  const tick = useCallback(() => {
    setTimers(prev => {
      let changed = false
      const next = { ...prev }
      for (const id in next) {
        const t = next[id]
        if (t.status !== 'running') continue
        const left = Math.round((t.endTime - Date.now()) / 1000)
        if (left <= 0) {
          next[id] = { ...t, remaining: 0, status: 'done' }
          changed = true
          if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200])
        } else if (left !== t.remaining) {
          next[id] = { ...t, remaining: left }
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [])

  useEffect(() => {
    intervalRef.current = setInterval(tick, 250)
    return () => clearInterval(intervalRef.current)
  }, [tick])

  const startTimer = useCallback((id, seconds, label) => {
    setTimers(prev => {
      const existing = prev[id]
      const duration = existing?.status === 'paused' ? existing.remaining : seconds
      return {
        ...prev,
        [id]: {
          seconds,
          label,
          status: 'running',
          remaining: duration,
          endTime: Date.now() + duration * 1000,
        },
      }
    })
  }, [])

  const pauseTimer = useCallback((id) => {
    setTimers(prev => {
      const t = prev[id]
      if (!t || t.status !== 'running') return prev
      return { ...prev, [id]: { ...t, status: 'paused' } }
    })
  }, [])

  const cancelTimer = useCallback((id) => {
    setTimers(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }, [])

  const resetTimer = useCallback((id) => {
    setTimers(prev => {
      const t = prev[id]
      if (!t) return prev
      return { ...prev, [id]: { ...t, status: 'idle', remaining: t.seconds } }
    })
  }, [])

  const getTimer = useCallback((id) => timers[id] || null, [timers])

  const activeTimers = Object.entries(timers)
    .filter(([, t]) => t.status === 'running' || t.status === 'done' || t.status === 'paused')
    .map(([id, t]) => ({ id, ...t }))

  return (
    <TimerContext.Provider value={{ timers, startTimer, pauseTimer, cancelTimer, resetTimer, getTimer, activeTimers }}>
      {children}
    </TimerContext.Provider>
  )
}

export function useTimers() {
  return useContext(TimerContext)
}
