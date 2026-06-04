'use client'
import { useState, useEffect } from 'react'
import { Waves, Sun, Home, Users, Star } from 'lucide-react'

type Option = {
  title: string
  description: string
  image: string
  icon: React.ReactNode
}

const options: Option[] = [
  {
    title: 'Pileta Familiar',
    description: 'Losetas atérmicas en pileta residencial',
    image: '/img/Pileta%20Cliente%201.JPG',
    icon: <Waves size={20} />,
  },
  {
    title: 'Área de Relax',
    description: 'Solarium fresco y antideslizante',
    image: '/img/Pileta%20Cliente%203.JPG',
    icon: <Sun size={20} />,
  },
  {
    title: 'Zona Exterior',
    description: 'Espacio exterior completamente equipado',
    image: '/img/Pileta%20Cliente%205.JPG',
    icon: <Home size={20} />,
  },
  {
    title: 'Pileta de Club',
    description: 'Instalación en espacios comunitarios',
    image: '/img/Pileta%20Cliente%207.JPG',
    icon: <Users size={20} />,
  },
  {
    title: 'Proyecto Integral',
    description: 'Transformación completa del espacio',
    image: '/img/Pileta%20Cliente%2011.JPG',
    icon: <Star size={20} />,
  },
]

export default function InteractiveSelector() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [animated, setAnimated] = useState<number[]>([])

  useEffect(() => {
    const timers = options.map((_, i) =>
      setTimeout(() => setAnimated(prev => [...prev, i]), 180 * i)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div style={{ display: 'flex', width: '100%', height: '460px', overflow: 'hidden' }}>
      {options.map((option, index) => {
        const isActive = activeIndex === index
        const isVisible = animated.includes(index)

        return (
          <div
            key={index}
            onClick={() => setActiveIndex(index)}
            style={{
              backgroundImage: `url('${option.image}')`,
              backgroundSize: isActive ? 'auto 100%' : 'auto 120%',
              backgroundPosition: 'center',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateX(0)' : 'translateX(-60px)',
              transition: 'flex 0.7s ease-in-out, opacity 0.5s ease, transform 0.5s ease, box-shadow 0.7s ease, background-size 0.7s ease',
              flex: isActive ? '7 1 0%' : '1 1 0%',
              minWidth: '60px',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              backgroundColor: 'var(--dark)',
              border: `1px solid ${isActive ? 'rgba(232,82,26,0.5)' : 'var(--border-line)'}`,
              marginRight: index < options.length - 1 ? '2px' : '0',
              boxShadow: isActive ? '0 20px 60px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.3)',
            }}
          >
            {/* Gradiente sombra inferior */}
            <div style={{
              position: 'absolute', left: 0, right: 0,
              bottom: isActive ? 0 : -40,
              height: '140px',
              background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 100%)',
              transition: 'bottom 0.7s ease',
              pointerEvents: 'none',
            }} />

            {/* Label */}
            <div style={{
              position: 'absolute', bottom: '20px', left: 0, right: 0,
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '0 16px', pointerEvents: 'none',
            }}>
              {/* Ícono */}
              <div style={{
                minWidth: '40px', maxWidth: '40px', height: '40px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isActive ? 'var(--orange)' : 'rgba(20,20,20,0.85)',
                border: `1px solid ${isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.12)'}`,
                flexShrink: 0,
                color: 'white',
                transition: 'background 0.4s ease',
              }}>
                {option.icon}
              </div>

              {/* Texto */}
              <div style={{ overflow: 'hidden' }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '16px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'white',
                  whiteSpace: 'nowrap',
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? 'translateX(0)' : 'translateX(20px)',
                  transition: 'opacity 0.6s ease, transform 0.6s ease',
                }}>{option.title}</div>
                <div style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.6)',
                  whiteSpace: 'nowrap',
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? 'translateX(0)' : 'translateX(20px)',
                  transition: 'opacity 0.6s 0.06s ease, transform 0.6s 0.06s ease',
                }}>{option.description}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
