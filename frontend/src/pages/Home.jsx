import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Zap, TrendingUp, Tag, ShieldCheck, RotateCcw, Truck, CreditCard } from 'lucide-react'
import HeroBanner from '../components/HeroBanner'
import ProductCard from '../components/ProductCard'
import api from '../api/axios'

/* ── constants ── */
const CAT_META = {
  electronics:      { emoji: '📱', img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80', color: '#e3f2fd' },
  fashion:          { emoji: '👗', img: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80', color: '#fce4ec' },
  'home-furniture': { emoji: '🛋️', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80', color: '#e8f5e9' },
  appliances:       { emoji: '🏠', img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80', color: '#fff3e0' },
  'sports-fitness': { emoji: '🏋️', img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80', color: '#f3e5f5' },
}

const TRUST_BARS = [
  { icon: <Truck       size={22} />, label: 'Free Delivery',  sub: 'Orders above ₹499',   color: '#2874f0' },
  { icon: <RotateCcw   size={22} />, label: '7-Day Returns',  sub: 'No questions asked',   color: '#388e3c' },
  { icon: <CreditCard  size={22} />, label: 'Secure Payments',sub: 'UPI · Cards · COD',    color: '#ff9f00' },
  { icon: <ShieldCheck size={22} />, label: '100% Genuine',   sub: 'Authentic products',   color: '#e91e63' },
]

const BRANDS = [
  { name: 'Samsung',  logo: 'https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=200&q=80', slug: 'Samsung' },
  { name: 'Apple',    logo: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&q=80', slug: 'Apple'   },
  { name: 'Nike',     logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80',   slug: 'Nike'    },
  { name: 'Adidas',   logo: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=200&q=80', slug: 'Adidas' },
  { name: 'LG',       logo: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=200&q=80', slug: 'LG'      },
  { name: 'Sony',     logo: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=200&q=80', slug: 'Sony'   },
]

const DEALS_BANNERS = [
  {
    title: 'Electronics Sale',
    sub: 'Up to 40% off on Smartphones, Laptops & more',
    tag: 'MEGA DEAL',
    img: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600&q=80',
    link: '/products?category=electronics',
    grad: 'linear-gradient(120deg, #1565c0, #0d47a1)',
    accent: '#ffc200',
  },
  {
    title: 'Fashion Week',
    sub: 'Flat 50% off on top brands',
    tag: 'LIMITED TIME',
    img: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80',
    link: '/products?category=fashion',
    grad: 'linear-gradient(120deg, #6a1b9a, #4a148c)',
    accent: '#f48fb1',
  },
]

const OFFER_CARDS = [
  { emoji: '🏷️', title: '10% Cashback',   sub: 'On SBI Credit Cards',  bg: '#e8f5e9', border: '#4caf50' },
  { emoji: '📦', title: 'No Cost EMI',    sub: 'On orders above ₹3000', bg: '#e3f2fd', border: '#2196f3' },
  { emoji: '🎁', title: 'Gift Cards',     sub: 'For every occasion',    bg: '#fff8e1', border: '#ffc107' },
  { emoji: '🚀', title: 'Express Delivery', sub: 'In 2 hours — select areas', bg: '#fce4ec', border: '#e91e63' },
]

export default function Home() {
  const [categories, setCategories] = useState([])
  const [featured,   setFeatured]   = useState([])
  const [latest,     setLatest]     = useState([])
  const [electronics, setElectronics] = useState([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, featRes, latestRes, elecRes] = await Promise.all([
          api.get('/products/categories/all'),
          api.get('/products?featured=true&limit=8'),
          api.get('/products?limit=8'),
          api.get('/products?category=electronics&limit=4'),
        ])
        setCategories(catRes.data)
        setFeatured(featRes.data.products)
        setLatest(latestRes.data.products)
        setElectronics(elecRes.data.products)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return (
    <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="spinner" />
    </div>
  )

  return (
    <div className="page">

      {/* ══════════════ HERO ══════════════ */}
      <HeroBanner />

      <div className="container">

        {/* ══════════════ TRUST BAR ══════════════ */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: 10, margin: '12px 0',
        }}>
          {TRUST_BARS.map((b) => (
            <div key={b.label} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 18px', background: 'white', borderRadius: 8,
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: `1.5px solid ${b.color}22`,
            }}>
              <div style={{ color: b.color, flexShrink: 0 }}>{b.icon}</div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#212121' }}>{b.label}</p>
                <p style={{ fontSize: 11, color: '#878787', marginTop: 2 }}>{b.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ══════════════ CATEGORY GRID ══════════════ */}
        <div style={{
          background: 'white', borderRadius: 4,
          padding: '24px 20px', margin: '12px 0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Shop by Category</h2>
            <Link to="/products" style={{ fontSize: 13, color: '#2874f0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
            {categories.map((cat) => {
              const meta = CAT_META[cat.slug] || { emoji: '🛍️', img: '', color: '#f5f5f5' }
              return (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.slug}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    borderRadius: 10, overflow: 'hidden',
                    border: '1.5px solid #e0e0e0',
                    transition: 'all 0.22s ease', background: 'white',
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 22px rgba(0,0,0,0.12)'; e.currentTarget.style.borderColor = '#2874f0' }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e0e0e0' }}
                  >
                    {/* Category image */}
                    <div style={{ height: 110, overflow: 'hidden', background: meta.color, position: 'relative' }}>
                      {meta.img && (
                        <img src={meta.img} alt={cat.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                          onMouseEnter={(e) => (e.target.style.transform = 'scale(1.06)')}
                          onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
                          onError={(e) => { e.target.style.display = 'none' }}
                        />
                      )}
                      {/* Overlay */}
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 60%)' }} />
                    </div>
                    <div style={{ padding: '10px 12px' }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#212121' }}>{meta.emoji} {cat.name}</p>
                      <p style={{ fontSize: 11, color: '#2874f0', fontWeight: 600, marginTop: 3 }}>{cat.product_count} products →</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* ══════════════ DEALS BANNERS ══════════════ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12, margin: '12px 0' }}>
          {DEALS_BANNERS.map((b) => (
            <Link key={b.title} to={b.link} style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{
                position: 'relative', borderRadius: 10, overflow: 'hidden',
                background: b.grad, height: 180,
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,0.2)' }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.12)' }}
              >
                {/* Product image */}
                <img src={b.img} alt={b.title} style={{
                  position: 'absolute', right: 0, top: 0,
                  height: '100%', width: '55%', objectFit: 'cover',
                  opacity: 0.4,
                }} />

                {/* Content */}
                <div style={{ position: 'relative', zIndex: 2, padding: '22px 24px' }}>
                  <span style={{
                    display: 'inline-block', fontSize: 10, fontWeight: 800,
                    letterSpacing: '1.4px', color: b.accent,
                    background: 'rgba(255,255,255,0.1)',
                    padding: '3px 10px', borderRadius: 99, marginBottom: 10,
                    border: `1px solid ${b.accent}55`,
                  }}>{b.tag}</span>
                  <h3 style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 8 }}>{b.title}</h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.82)', marginBottom: 18 }}>{b.sub}</p>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 18px', background: b.accent,
                    color: '#212121', fontWeight: 700, fontSize: 12, borderRadius: 4,
                  }}>
                    Shop Now →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ══════════════ FEATURED PRODUCTS ══════════════ */}
        {featured.length > 0 && (
          <div style={{
            background: 'white', borderRadius: 4, overflow: 'hidden',
            margin: '12px 0', boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          }}>
            <div style={{
              padding: '18px 20px 14px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: '1px solid #eeeeee',
              background: 'linear-gradient(90deg, #fffbf0, white 60%)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={22} style={{ color: '#ffc200', fill: '#ffc200' }} />
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>Featured Products</h2>
                <span style={{ fontSize: 11, background: '#ff9f00', color: 'white', padding: '2px 8px', borderRadius: 99, fontWeight: 800 }}>HOT</span>
              </div>
              <Link to="/products?featured=true" style={{ fontSize: 13, color: '#2874f0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="product-grid">
              {featured.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}

        {/* ══════════════ OFFER CARDS ══════════════ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, margin: '12px 0' }}>
          {OFFER_CARDS.map((o) => (
            <div key={o.title} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '16px 18px', background: o.bg,
              border: `1.5px solid ${o.border}44`, borderRadius: 10,
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)' }}
            >
              <span style={{ fontSize: 28 }}>{o.emoji}</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#212121' }}>{o.title}</p>
                <p style={{ fontSize: 11, color: '#878787', marginTop: 2 }}>{o.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ══════════════ ELECTRONICS SPOTLIGHT ══════════════ */}
        {electronics.length > 0 && (
          <div style={{
            background: 'white', borderRadius: 4, overflow: 'hidden',
            margin: '12px 0', boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          }}>
            {/* Banner header with image */}
            <div style={{
              background: 'linear-gradient(120deg, #0d47a1, #1976d2)',
              padding: '20px 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              position: 'relative', overflow: 'hidden',
            }}>
              <img
                src="https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=70"
                alt=""
                style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: '50%', objectFit: 'cover', opacity: 0.15 }}
              />
              <div style={{ position: 'relative', zIndex: 2 }}>
                <p style={{ fontSize: 11, color: '#90caf9', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4 }}>📱 Electronics</p>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>Best in Tech</h2>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>Smartphones · Laptops · Accessories</p>
              </div>
              <Link to="/products?category=electronics"
                style={{
                  position: 'relative', zIndex: 2,
                  padding: '9px 20px', background: '#ffc200',
                  color: '#212121', fontWeight: 700, fontSize: 13,
                  borderRadius: 4, textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
                }}>
                Shop All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="product-grid">
              {electronics.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}

        {/* ══════════════ POPULAR BRANDS ══════════════ */}
        <div style={{
          background: 'white', borderRadius: 4,
          padding: '24px 20px', margin: '12px 0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Popular Brands</h2>
            <Link to="/products" style={{ fontSize: 13, color: '#2874f0', fontWeight: 600 }}>All Brands →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
            {BRANDS.map((b) => (
              <Link key={b.name} to={`/products?search=${encodeURIComponent(b.name)}`} className="brand-card">
                <div style={{ width: 64, height: 64, borderRadius: 8, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                  <img src={b.logo} alt={b.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#212121' }}>{b.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ══════════════ TRENDING NOW ══════════════ */}
        <div style={{
          background: 'white', borderRadius: 4, overflow: 'hidden',
          margin: '12px 0', boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        }}>
          <div style={{
            padding: '18px 20px 14px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: '1px solid #eeeeee',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={22} style={{ color: '#2874f0' }} />
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>Trending Now</h2>
            </div>
            <Link to="/products" style={{ fontSize: 13, color: '#2874f0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="product-grid">
            {latest.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>

        {/* ══════════════ BOTTOM PROMO STRIP ══════════════ */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 12, margin: '12px 0',
        }}>
          {[
            { cat: 'home-furniture', label: 'Home & Furniture',  sub: 'Starting ₹999',       img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80', grad: 'linear-gradient(120deg,#1b5e20,#2e7d32)' },
            { cat: 'sports-fitness', label: 'Sports & Fitness',  sub: 'Gear up under ₹1499', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&q=80', grad: 'linear-gradient(120deg,#bf360c,#e64a19)' },
            { cat: 'appliances',     label: 'Appliances',        sub: 'Big brands, big deals',img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&q=80', grad: 'linear-gradient(120deg,#4a148c,#7b1fa2)' },
          ].map((b) => (
            <Link key={b.cat} to={`/products?category=${b.cat}`}
              style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{
                position: 'relative', borderRadius: 10, overflow: 'hidden',
                height: 150, background: b.grad,
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)' }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)' }}
              >
                <img src={b.img} alt={b.label} style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: '60%', objectFit: 'cover', opacity: 0.35 }} />
                <div style={{ position: 'relative', zIndex: 2, padding: '20px 20px' }}>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: 'white', marginBottom: 5 }}>{b.label}</h3>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 14 }}>{b.sub}</p>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '6px 14px', background: 'rgba(255,255,255,0.18)',
                    color: 'white', fontWeight: 600, fontSize: 12, borderRadius: 4,
                    border: '1px solid rgba(255,255,255,0.3)',
                  }}>
                    Shop Now <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
