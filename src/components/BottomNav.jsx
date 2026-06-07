import { useNavigate, useLocation } from 'react-router-dom'

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const tabs = [
  { path: '/dashboard', icon: '🏠', label: 'Acasă' },
  { path: '/plan', icon: '📅', label: 'Plan' },
  { path: '/shopping', icon: '🛒', label: 'Cumpărături' },
  { path: '/preferences', icon: '👤', label: 'Profil' },
]

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '430px',
      backgroundColor: '#ffffff',
      borderTop: '0.5px solid #E8E6E0',
      zIndex: 50,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-around', paddingTop: '10px', paddingBottom: '16px' }}>
        {tabs.map(({ path, icon, label }) => {
          const active = location.pathname === path
          return (
            <button key={path} onClick={() => navigate(path)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', padding: '0 16px' }}>
              <span style={{ fontSize: '22px' }}>{icon}</span>
              <span style={{ fontSize: '10px', fontWeight: 600, color: active ? '#2D5A27' : '#B4B2A9', fontFamily: "'DM Sans', sans-serif" }}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}