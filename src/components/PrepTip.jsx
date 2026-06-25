import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function PrepTip({ tip, dayIndex }) {
  const [open, setOpen] = useState(false)
  const { markBatchCooked, unmarkBatchCooked, isBatchCooked } = useApp()
  const batched = isBatchCooked(tip.ingredientKey, dayIndex)

  return (
    <div className="flex justify-end pr-2 -mt-1 mb-1">
      <div
        onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
        className="cursor-pointer select-none"
      >
        <div
          className="relative transition-all duration-400 ease-out"
          style={{
            transform: open ? 'rotate(0deg)' : 'rotate(2deg)',
            transformOrigin: 'top right',
          }}
        >
          <div
            className="relative transition-all duration-400 ease-out overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #FFF9C4 0%, #FFF176 50%, #FFEE58 100%)',
              borderRadius: open ? '3px 3px 10px 3px' : '3px',
              boxShadow: open
                ? '1px 3px 8px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.4)'
                : '1px 1px 4px rgba(0,0,0,0.1)',
              padding: open ? '10px 12px' : '4px 10px',
              maxWidth: open ? '280px' : '64px',
              maxHeight: open ? '200px' : '26px',
            }}
          >
            {/* Collapsed: tiny crumpled note */}
            <div
              className="flex items-center gap-1 transition-all duration-300"
              style={{
                opacity: open ? 0 : 1,
                height: open ? 0 : 'auto',
                overflow: 'hidden',
              }}
            >
              <span className="text-[10px]">💡</span>
              <span className="text-[10px] font-bold" style={{ color: '#E65100' }}>Sfat</span>
            </div>

            {/* Expanded */}
            <div
              className="flex flex-col gap-2 transition-all duration-400"
              style={{
                opacity: open ? 1 : 0,
                height: open ? 'auto' : 0,
                overflow: 'hidden',
              }}
            >
              <p className="text-[11px] leading-relaxed" style={{ color: '#5D4037' }}>
                {tip.message}
              </p>

              {tip.type === 'batch' && (
                !batched ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      markBatchCooked(tip.ingredientKey, dayIndex, tip.totalAmount)
                    }}
                    className="self-start text-[10px] font-bold px-2 py-1 rounded-md active:scale-95 transition"
                    style={{ background: 'rgba(230,81,0,0.12)', color: '#E65100' }}
                  >
                    ✅ Am gătit {tip.totalAmount}{tip.unit}
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      unmarkBatchCooked(tip.ingredientKey)
                    }}
                    className="self-start text-[10px] font-bold px-2 py-1 rounded-md active:scale-95 transition"
                    style={{ background: 'rgba(46,125,50,0.12)', color: '#2E7D32' }}
                  >
                    ✅ Pregătit — apasă pentru a anula
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
