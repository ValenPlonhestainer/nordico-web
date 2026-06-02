"use client"

import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const testimonials = [
  {
    tempId: 0,
    testimonial: 'Buenos precios buena atención buen producto muy recomendables.',
    by: 'Sheraton Pilar Javier',
    imgSrc: 'https://lh3.googleusercontent.com/a/ACg8ocLc93ePV4VC5xM3EmA4h7J5PDpNYWazNXjo4zXNjIVsg-oGRw=w72-h72-p-rp-mo-ba2-br100',
  },
  {
    tempId: 1,
    testimonial: 'Excelente atención, productos de calidad, cumplimiento en tiempo y forma en cuanto a la entrega, precios accesibles.',
    by: 'Marta Ripari',
    imgSrc: 'https://lh3.googleusercontent.com/a-/ALV-UjWKd3HHHSW1VoBxwBEn03vNQfoCCei16wSJDJLmk0355qQi0VU=w72-h72-p-rp-mo-ba2-br100',
  },
  {
    tempId: 2,
    testimonial: 'Atendidos por sus dueños, muy amables.',
    by: 'Héctor Osvaldo M.',
    imgSrc: 'https://lh3.googleusercontent.com/a/ACg8ocLGD_vkqoOSlp76F6w1HMG7sCsLWS_Bif_4k3PwgxLXHMtb9A=w72-h72-p-rp-mo-ba3-br100',
  },
  {
    tempId: 3,
    testimonial: 'Excelente todo desde el primer contacto hasta la entrega. Compré sin conocerlos fisicamente, evacuaron todas mis dudas y ...',
    by: 'Darío González',
    imgSrc: 'https://lh3.googleusercontent.com/a/ACg8ocLKpxBuK0pyR-hJIc1Ib5DOnIPrVrA-mt5yVaCyawUIYBhFzw=w72-h72-p-rp-mo-ba3-br100',
  },
  {
    tempId: 4,
    testimonial: 'Excelente terminación. Facilita mucho su colocación.',
    by: 'Silvio Ismael Bravo',
    imgSrc: 'https://lh3.googleusercontent.com/a-/ALV-UjVXGahps3Sffsfruy5CaXyEdKhPjtSFhG7-7jfg2rBOWPBm09Fa=w72-h72-p-rp-mo-br100',
  },
]

interface TestimonialCardProps {
  position: number
  testimonial: typeof testimonials[0]
  handleMove: (steps: number) => void
  cardSize: number
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  position,
  testimonial,
  handleMove,
  cardSize,
}) => {
  const isCenter = position === 0
  const isMobile = cardSize < 350

  const pad        = isMobile ? 18 : 32
  const cornerSize = isMobile ? 32 : 50
  const centerY    = isMobile ? -38 : -65
  const sideY      = isMobile ? 10  : 15
  const diagTop    = cornerSize - 2
  const diagWidth  = Math.sqrt(2) * cornerSize * 1.5

  return (
    <div
      onClick={() => handleMove(position)}
      className={cn(
        'absolute left-1/2 top-1/2 cursor-pointer border-2 transition-all duration-500 ease-in-out',
        isCenter
          ? 'z-10 bg-primary text-primary-foreground border-primary'
          : 'z-0 bg-card text-card-foreground border-border hover:border-primary',
      )}
      style={{
        width: cardSize,
        height: cardSize,
        padding: pad,
        clipPath: `polygon(${cornerSize}px 0%, calc(100% - ${cornerSize}px) 0%, 100% ${cornerSize}px, 100% 100%, calc(100% - ${cornerSize}px) 100%, ${cornerSize}px 100%, 0 100%, 0 0)`,
        transform: `
          translate(-50%, -50%)
          translateX(${(cardSize / 1.5) * position}px)
          translateY(${isCenter ? centerY : position % 2 ? sideY : -sideY}px)
          rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)
        `,
        boxShadow: isCenter ? '0px 8px 0px 4px hsl(var(--border))' : '0px 0px 0px 0px transparent',
      }}
    >
      <span
        className="absolute block origin-top-right rotate-45 bg-border"
        style={{ right: -2, top: diagTop, width: diagWidth, height: 2 }}
      />

      <img
        src={testimonial.imgSrc}
        alt={testimonial.by}
        className="bg-muted object-cover object-top"
        style={{
          display: 'block',
          width: isMobile ? 36 : 48,
          height: isMobile ? 44 : 56,
          marginBottom: isMobile ? 10 : 16,
          boxShadow: '3px 3px 0px hsl(var(--background))',
        }}
      />

      <h3
        className={cn(
          'font-medium leading-snug',
          isMobile ? 'text-sm' : 'text-base sm:text-xl',
          isCenter ? 'text-primary-foreground' : 'text-foreground',
        )}
      >
        "{testimonial.testimonial}"
      </h3>

      <p
        className={cn(
          'absolute italic',
          isMobile ? 'text-xs' : 'text-sm',
          isCenter ? 'text-primary-foreground' : 'text-muted-foreground',
        )}
        style={{ bottom: pad, left: pad, right: pad }}
      >
        — {testimonial.by}
      </p>
    </div>
  )
}

export const StaggerTestimonials: React.FC = () => {
  const [cardSize, setCardSize] = useState(365)
  const [testimonialsList, setTestimonialsList] = useState(testimonials)

  const handleMove = (steps: number) => {
    const newList = [...testimonialsList]
    if (steps > 0) {
      for (let i = steps; i > 0; i--) {
        const item = newList.shift()
        if (!item) return
        newList.push({ ...item, tempId: Math.random() })
      }
    } else {
      for (let i = steps; i < 0; i++) {
        const item = newList.pop()
        if (!item) return
        newList.unshift({ ...item, tempId: Math.random() })
      }
    }
    setTestimonialsList(newList)
  }

  useEffect(() => {
    const updateSize = () => {
      const sm = window.matchMedia('(min-width: 640px)').matches
      const xs = window.matchMedia('(max-width: 380px)').matches
      setCardSize(sm ? 365 : xs ? 255 : 290)
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  const isMobile    = cardSize < 350
  const centerY     = isMobile ? -38 : -65
  const sideY       = isMobile ? 10  : 15

  const minTopMargin   = cardSize / 2 - centerY + sideY + 10
  const containerHeight = Math.round(minTopMargin * 2 + 8)

  return (
    <div className="w-full" style={{ background: 'var(--black)' }}>
      <div className="relative overflow-hidden" style={{ height: containerHeight }}>
        {testimonialsList.map((testimonial, index) => {
          const position = index - Math.floor(testimonialsList.length / 2)
          return (
            <TestimonialCard
              key={testimonial.tempId}
              testimonial={testimonial}
              handleMove={handleMove}
              position={position}
              cardSize={cardSize}
            />
          )
        })}
      </div>

      <div className="flex justify-center gap-2" style={{ padding: '20px 0 16px' }}>
        <button
          onClick={() => handleMove(-1)}
          className="flex items-center justify-center transition-opacity hover:opacity-80 focus-visible:outline-none"
          style={{
            width: isMobile ? 48 : 56,
            height: isMobile ? 48 : 56,
            background: '#0E0E0E',
            border: '2px solid var(--orange)',
            color: 'var(--orange)',
          }}
          aria-label="Reseña anterior"
        >
          <ChevronLeft strokeWidth={2.5} size={isMobile ? 20 : 24} />
        </button>
        <button
          onClick={() => handleMove(1)}
          className="flex items-center justify-center transition-opacity hover:opacity-80 focus-visible:outline-none"
          style={{
            width: isMobile ? 48 : 56,
            height: isMobile ? 48 : 56,
            background: '#0E0E0E',
            border: '2px solid var(--orange)',
            color: 'var(--orange)',
          }}
          aria-label="Reseña siguiente"
        >
          <ChevronRight strokeWidth={2.5} size={isMobile ? 20 : 24} />
        </button>
      </div>

      <div className="flex justify-center" style={{ paddingBottom: '40px' }}>
        <a
          href="https://www.google.com/maps/place/Atermicos+y+Baldosas+Nordico/@-32.408975,-65.0115174,919m/data=!3m1!1e3!4m8!3m7!1s0x95d2e374b60b26ff:0x891caa300994e1f2!8m2!3d-32.4083233!4d-65.0145231!9m1!1b1!16s%2Fg%2F11s3dgbrf_?entry=ttu&g_ep=EgoyMDI2MDUyMC4wIKXMDSoASAFQAw%3D%3D"
          target="_blank"
          rel="noopener noreferrer"
          className="google-reviews-link"
        >
          <span className="google-reviews-stars">★★★★★</span>
          Mirá todas nuestras reseñas en Google
        </a>
      </div>
    </div>
  )
}
