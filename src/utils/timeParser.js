const timePattern = /(\d+)\s*[-–]\s*(\d+)\s*(minut[eăa]?|secund[eăa]?|ore?)|(\d+)\s*(minut[eăa]?|secund[eăa]?|ore?)/gi

function toSeconds(value, unit) {
  const u = unit.toLowerCase()
  if (u.startsWith('secund')) return value
  if (u.startsWith('minut')) return value * 60
  if (u.startsWith('or')) return value * 3600
  return value * 60
}

export function extractTimers(stepText) {
  if (!stepText) return []

  const timers = []
  let match

  const regex = new RegExp(timePattern.source, 'gi')
  while ((match = regex.exec(stepText)) !== null) {
    if (match[1] && match[2]) {
      const high = parseInt(match[2])
      const unit = match[3]
      const seconds = toSeconds(high, unit)
      if (seconds > 3600 * 2) continue
      timers.push({
        seconds,
        label: `${match[1]}-${match[2]} ${match[3]}`,
        index: match.index,
        length: match[0].length,
      })
    } else if (match[4]) {
      const val = parseInt(match[4])
      const unit = match[5]
      const seconds = toSeconds(val, unit)
      if (seconds > 3600 * 2) continue
      timers.push({
        seconds,
        label: `${match[4]} ${match[5]}`,
        index: match.index,
        length: match[0].length,
      })
    }
  }

  return timers
}

export function formatTimer(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  if (mins === 0) return `${secs}s`
  return `${mins}:${String(secs).padStart(2, '0')}`
}
