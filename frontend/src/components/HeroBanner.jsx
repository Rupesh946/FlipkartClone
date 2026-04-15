import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const SLIDES = [
  {
    id: 1,
    tag: '⚡ ELECTRONICS MEGA SALE',
    title: 'Smartphones &\nLaptops',
    subtitle: 'Up to 40% off on Samsung, Apple, OnePlus & more',
    cta: 'Shop Electronics',
    link: '/products?category=electronics',
    bg: 'linear-gradient(120deg, #0a2e6e 0%, #1565c0 55%, #1976d2 100%)',
    img: 'https://images.unsplash.com/photo-1605170439002-90845e8c0137?w=700&q=80',
    accent: '#ffc200',
  },
  {
    id: 2,
    tag: '👗 FASHION WEEK',
    title: 'Style Starts\nHere',
    subtitle: "Flat 50% off on Nike, Adidas, Levi's & more",
    cta: 'Shop Fashion',
    link: '/products?category=fashion',
    bg: 'linear-gradient(120deg, #2d0045 0%, #6a1b9a 55%, #9c27b0 100%)',
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=80',
    accent: '#f48fb1',
  },
  {
    id: 3,
    tag: '🛋️ HOME & LIVING',
    title: 'Transform\nYour Home',
    subtitle: 'Furniture, décor & appliances at unbeatable prices',
    cta: 'Shop Home',
    link: '/products?category=home-furniture',
    bg: 'linear-gradient(120deg, #0d2e14 0%, #1b5e20 55%, #2e7d32 100%)',
    img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700&q=80',
    accent: '#a5d6a7',
  },
  {
    id: 4,
    tag: '🏋️ SPORTS & FITNESS',
    title: 'Level Up\nYour Game',
    subtitle: 'Equipment, gear & essentials for every athlete',
    cta: 'Shop Sports',
    link: '/products?category=sports-fitness',
    bg: 'linear-gradient(120deg, #3e0a00 0%, #bf360c 55%, #e64a19 100%)',
    img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=700&q=80',
    accent: '#ffccbc',
  },
]

export default function HeroBanner() {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)

  const goTo = useCallback((idx) => {
    if (animating) return
    setAnimating(true)
    setTimeout(() => {
      setCurrent((idx + SLIDES.length) % SLIDES.length)
      setAnimating(false)
    }, 300)
  }, [animating])

  useEffect(() => {
    const timer = setInterval(() => goTo(current + 1), 5000)
    return () => clearInterval(timer)
  }, [current, goTo])

  const slide = SLIDES[current]

  return (
    <div style={{ position: 'relative', overflow: 'hidden', height: 320 }}>

      {/* ── Background gradient ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: slide.bg,
        transition: 'background 0.5s ease',
      }} />

      {/* ── Right side product image — full visibility ── */}
      <div style={{
        position: 'absolute',
        right: 0, top: 0, bottom: 0,
        width: '48%',
        overflow: 'hidden',
      }}>
        {/* Fade-left mask so image blends into gradient */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          background: `linear-gradient(to right, ${slide.bg.match(/#[a-f0-9]{6}/gi)?.[1] || '#1565c0'} 0%, transparent 35%)`,
          transition: 'background 0.5s ease',
        }} />
        <img
          key={slide.id}
          src={slide.img}
          alt={slide.title}
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center',
            opacity: animating ? 0 : 1,
            transform: animating ? 'scale(1.04)' : 'scale(1)',
            transition: 'opacity 0.35s ease, transform 0.35s ease',
          }}
          onError={(e) => { e.target.style.display = 'none' }}
        />
      </div>

      {/* ── Left content ── */}
      <div style={{
        position: 'relative', zIndex: 5,
        maxWidth: 1280, margin: '0 auto',
        padding: '0 56px', height: '100%',
        display: 'flex', alignItems: 'center',
      }}>
        <div style={{
          maxWidth: 480,
          opacity: animating ? 0 : 1,
          transform: animating ? 'translateX(-12px)' : 'translateX(0)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
        }}>
          {/* Tag pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center',
            fontSize: 10, fontWeight: 800, letterSpacing: '1.4px',
            color: slide.accent,
            background: 'rgba(255,255,255,0.12)',
            padding: '5px 14px', borderRadius: 99, marginBottom: 16,
            border: `1px solid ${slide.accent}55`,
            backdropFilter: 'blur(4px)',
          }}>
            {slide.tag}
          </div>

          {/* Headline */}
          <h2 style={{
            fontSize: 'clamp(26px, 3.6vw, 44px)',
            fontWeight: 900, color: 'white',
            lineHeight: 1.12, marginBottom: 14,
            whiteSpace: 'pre-line',
            textShadow: '0 2px 12px rgba(0,0,0,0.3)',
          }}>
            {slide.title}
          </h2>

          {/* Subtitle */}
          <p style={{
            fontSize: 15, color: 'rgba(255,255,255,0.86)',
            marginBottom: 30, maxWidth: 400, lineHeight: 1.5,
            textShadow: '0 1px 4px rgba(0,0,0,0.2)',
          }}>
            {slide.subtitle}
          </p>

          {/* CTA button */}
          <Link
            to={slide.link}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 28px',
              background: slide.accent, color: '#212121',
              fontWeight: 800, fontSize: 14, borderRadius: 4,
              textDecoration: 'none',
              boxShadow: `0 4px 20px ${slide.accent}55`,
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 28px ${slide.accent}66` }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 20px ${slide.accent}55` }}
          >
            {slide.cta} →
          </Link>
        </div>
      </div>

      {/* ── Prev button ── */}
      <button
        onClick={() => goTo(current - 1)}
        aria-label="Previous slide"
        style={{
          position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
          zIndex: 10, width: 44, height: 44, borderRadius: '50%',
          background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)',
          border: '1px solid rgba(255,255,255,0.3)', color: 'white',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.32)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
      >
        <ChevronLeft size={22} />
      </button>

      {/* ── Next button ── */}
      <button
        onClick={() => goTo(current + 1)}
        aria-label="Next slide"
        style={{
          position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
          zIndex: 10, width: 44, height: 44, borderRadius: '50%',
          background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)',
          border: '1px solid rgba(255,255,255,0.3)', color: 'white',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.32)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
      >
        <ChevronRight size={22} />
      </button>

      {/* ── Dot indicators ── */}
      <div style={{
        position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 7, zIndex: 10,
      }}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              width: i === current ? 26 : 8, height: 8,
              borderRadius: 4, border: 'none', cursor: 'pointer', padding: 0,
              background: i === current ? 'white' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>

      {/* ── Slide counter ── */}
      <div style={{
        position: 'absolute', top: 16, right: 68,
        zIndex: 10, fontSize: 12, color: 'rgba(255,255,255,0.6)',
        fontWeight: 600, letterSpacing: '1px',
      }}>
        {String(current + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
      </div>

    </div>
  )
}
