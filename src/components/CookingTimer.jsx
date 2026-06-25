import { useTimers } from '../context/TimerContext'
import { formatTimer } from '../utils/timeParser'

export default function CookingTimer({ seconds, label, timerId }) {
  const { startTimer, pauseTimer, resetTimer, getTimer } = useTimers()
  const timer = getTimer(timerId)
  const status = timer?.status || 'idle'
  const remaining = timer?.remaining ?? seconds

  if (status === 'idle' || !timer) {
    return (
      <button onClick={(e) => { e.stopPropagation(); startTimer(timerId, seconds, label) }}
        className="inline-flex items-center gap-1.5 bg-[#EAF3DE] text-[#2D5A27] text-[12px] font-semibold px-2.5 py-1 rounded-full ml-1 active:bg-[#C0DD97] transition whitespace-nowrap">
        <span>⏱️</span>
        <span>{label}</span>
      </button>
    )
  }

  if (status === 'done') {
    return (
      <span onClick={(e) => { e.stopPropagation(); resetTimer(timerId) }}
        className="inline-flex items-center gap-1.5 bg-[#2D5A27] text-white text-[12px] font-bold px-2.5 py-1 rounded-full ml-1 animate-pulse cursor-pointer whitespace-nowrap">
        <span>✅</span>
        <span>Gata!</span>
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 ml-1 whitespace-nowrap">
      <span onClick={(e) => { e.stopPropagation(); status === 'running' ? pauseTimer(timerId) : startTimer(timerId, seconds, label) }}
        className={`inline-flex items-center gap-1.5 text-[12px] font-bold px-2.5 py-1 rounded-full cursor-pointer transition ${
          status === 'running'
            ? 'bg-[#2D5A27] text-[#C0DD97]'
            : 'bg-[#F0EEE8] text-[#5F5E5A]'
        }`}>
        <span>{status === 'running' ? '⏸' : '▶️'}</span>
        <span>{formatTimer(remaining)}</span>
      </span>
      <span onClick={(e) => { e.stopPropagation(); resetTimer(timerId) }}
        className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#F0EEE8] text-[#B4B2A9] text-[10px] cursor-pointer active:bg-[#E8E6E0]">
        ✕
      </span>
    </span>
  )
}

export function FloatingTimerBar() {
  const { activeTimers, pauseTimer, startTimer, cancelTimer } = useTimers()

  const visible = activeTimers.filter(t => t.status === 'running' || t.status === 'done' || t.status === 'paused')
  if (visible.length === 0) return null

  return (
    <div className="fixed bottom-[80px] left-1/2 -translate-x-1/2 w-full max-w-[410px] px-3 z-40">
      <div className="bg-[#1a3d15] rounded-2xl shadow-lg overflow-hidden">
        {visible.map((t) => (
          <div key={t.id} className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 last:border-0">
            <span className="text-[16px]">
              {t.status === 'done' ? '🔔' : t.status === 'paused' ? '⏸' : '⏱️'}
            </span>
            <div className="flex-1 min-w-0">
              <p className={`text-[13px] font-bold truncate ${t.status === 'done' ? 'text-[#C0DD97]' : 'text-white'}`}>
                {t.status === 'done' ? 'Timpul a expirat!' : formatTimer(t.remaining)}
              </p>
              <p className="text-[11px] text-[#9FE1CB] truncate">{t.label}</p>
            </div>
            {t.status === 'running' && (
              <button onClick={() => pauseTimer(t.id)}
                className="text-[#9FE1CB] text-[11px] font-semibold px-2 py-1 rounded-lg bg-white/10 active:bg-white/20">
                Pauză
              </button>
            )}
            {t.status === 'paused' && (
              <button onClick={() => startTimer(t.id, t.seconds, t.label)}
                className="text-[#C0DD97] text-[11px] font-semibold px-2 py-1 rounded-lg bg-white/10 active:bg-white/20">
                Continuă
              </button>
            )}
            <button onClick={() => cancelTimer(t.id)}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 text-[#9FE1CB] text-[12px] active:bg-white/20 flex-shrink-0">
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
