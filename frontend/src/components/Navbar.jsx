import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingCart, Search, X, Package, Heart,
  User, ChevronDown, Store, Bell, LogOut,
  Settings, HelpCircle,
} from 'lucide-react'
import useCartStore from '../store/cartStore'
import useWishlistStore from '../store/wishlistStore'

const CATEGORIES = [
  { label: 'Electronics',      slug: 'electronics',     icon: '📱' },
  { label: 'Fashion',          slug: 'fashion',         icon: '👗' },
  { label: 'Home & Furniture', slug: 'home-furniture',  icon: '🛋️' },
  { label: 'Appliances',       slug: 'appliances',      icon: '🏠' },
  { label: 'Sports & Fitness', slug: 'sports-fitness',  icon: '🏋️' },
  { label: '⚡ Featured Deals', slug: null, featured: true },
]

const MOCK_USER = { name: 'John Doe', email: 'john@example.com', avatar: '🧑‍💼' }

export default function Navbar() {
  const [search, setSearch]     = useState('')
  const [loginOpen, setLoginOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const inputRef  = useRef(null)
  const dropRef   = useRef(null)
  const navigate  = useNavigate()

  const { itemCount, fetchCart }      = useCartStore()
  const { items: wishlist }           = useWishlistStore()

  useEffect(() => { fetchCart() }, [fetchCart])

  useEffect(() => {
    const close = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setLoginOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    const q = search.trim()
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : '/products')
  }

  /* ── nav link style helper ── */
  const nl = (extra = {}) => ({
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 10px', color: 'white', textDecoration: 'none',
    borderRadius: 4, fontSize: 13, fontWeight: 500,
    cursor: 'pointer', transition: 'background 0.15s',
    whiteSpace: 'nowrap', ...extra,
  })

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      boxShadow: scrolled ? '0 3px 16px rgba(0,0,0,0.25)' : '0 1px 6px rgba(0,0,0,0.18)',
    }}>

      {/* ════════════ Main Blue Bar ════════════ */}
      <div style={{ background: 'linear-gradient(135deg, #2874f0 0%, #1a65e0 100%)', height: 56 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          maxWidth: 1280, margin: '0 auto', padding: '0 16px', height: '100%',
        }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, textDecoration: 'none', flexShrink: 0, marginRight: 6 }}>
            <span style={{ fontSize: 21, fontWeight: 800, color: 'white', fontStyle: 'italic', letterSpacing: '-0.3px' }}>flipkart</span>
            <span style={{ fontSize: 10, color: '#ffc200', fontStyle: 'italic', fontWeight: 600 }}>Explore <em>Plus ✦</em></span>
          </Link>

          {/* ── Search ── */}
          <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', maxWidth: 620 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                ref={inputRef}
                placeholder="Search for products, brands and more"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%', padding: '10px 40px 10px 14px',
                  border: 'none', borderRadius: '4px 0 0 4px',
                  fontSize: 14, color: '#212121', outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              {search && (
                <button type="button" onClick={() => setSearch('')}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: '#878787', padding: 2 }}>
                  <X size={15} />
                </button>
              )}
            </div>
            <button type="submit"
              style={{ padding: '10px 18px', background: '#faaf00', border: 'none', borderRadius: '0 4px 4px 0', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#212121', transition: 'background 0.15s' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f0a500')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#faaf00')}>
              <Search size={20} />
            </button>
          </form>

          {/* ── Right Actions ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 'auto' }}>

            {/* Become a Seller */}
            <a href="#" style={nl()} className="hide-mobile"
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
              <Store size={15} />
              <div style={{ lineHeight: 1.1 }}>
                <div style={{ fontSize: 11, opacity: 0.8 }}>Become a</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Seller</div>
              </div>
            </a>

            {/* Divider */}
            <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.25)', margin: '0 4px' }} className="hide-mobile" />

            {/* Login / Profile dropdown */}
            <div ref={dropRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setLoginOpen((o) => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px', background: 'white', borderRadius: 4,
                  border: 'none', cursor: 'pointer', color: '#2874f0',
                  fontWeight: 700, fontSize: 14, fontFamily: 'inherit',
                  transition: 'box-shadow 0.15s',
                  boxShadow: loginOpen ? '0 4px 14px rgba(0,0,0,0.15)' : 'none',
                }}>
                <User size={16} />
                <span>Login</span>
                <ChevronDown size={13} style={{ transform: loginOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {loginOpen && (
                <div className="dropdown" style={{ top: 'calc(100% + 10px)', right: 0, minWidth: 240 }}>
                  {/* User header */}
                  <div style={{ padding: '16px 18px', background: 'linear-gradient(135deg, #2874f0, #1a5dc8)', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                        {MOCK_USER.avatar}
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 15 }}>{MOCK_USER.name}</p>
                        <p style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>{MOCK_USER.email}</p>
                      </div>
                    </div>
                  </div>

                  {[
                    { icon: <Package size={15} />,     label: 'My Orders',  to: '/orders'   },
                    { icon: <Heart size={15} />,       label: 'Wishlist',   to: '/wishlist' },
                    { icon: <Settings size={15} />,    label: 'Settings',   to: '#'         },
                    { icon: <HelpCircle size={15} />,  label: 'Help',       to: '#'         },
                  ].map(({ icon, label, to }) => (
                    <Link key={label} to={to} className="dropdown-item" onClick={() => setLoginOpen(false)}>
                      <span style={{ color: '#2874f0' }}>{icon}</span> {label}
                    </Link>
                  ))}

                  <div style={{ height: 1, background: '#f0f0f0', margin: '4px 0' }} />

                  <button className="dropdown-item" style={{ color: '#d32f2f' }}>
                    <LogOut size={15} style={{ color: '#d32f2f' }} /> Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Divider */}
            <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.25)', margin: '0 4px' }} />

            {/* Wishlist */}
            <Link to="/wishlist"
              style={nl({ position: 'relative' })}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
              <Heart size={17}
                style={{
                  color: wishlist.length > 0 ? '#ff4081' : 'white',
                  fill:  wishlist.length > 0 ? '#ff4081' : 'transparent',
                  transition: 'all 0.2s',
                }}
              />
              <span className="hide-mobile">Wishlist</span>
              {wishlist.length > 0 && (
                <span style={{
                  position: 'absolute', top: -5, right: -3,
                  background: '#fb641b', color: 'white',
                  width: 17, height: 17, borderRadius: '50%',
                  fontSize: 9, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1.5px solid #2874f0',
                }}>{wishlist.length}</span>
              )}
            </Link>

            {/* Notification bell */}
            <button
              style={{ ...nl(), background: 'none', border: 'none', position: 'relative' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
              <Bell size={17} />
              <span style={{
                position: 'absolute', top: 3, right: 6,
                width: 7, height: 7, borderRadius: '50%',
                background: '#ff4081', border: '1.5px solid #2874f0',
              }} />
            </button>

            {/* Divider */}
            <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.25)', margin: '0 4px' }} />

            {/* Cart */}
            <Link to="/cart" style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', background: 'white', borderRadius: 4,
              color: '#2874f0', fontWeight: 700, fontSize: 14,
              textDecoration: 'none', position: 'relative',
              transition: 'box-shadow 0.15s',
            }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.18)')}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}>
              <ShoppingCart size={18} />
              <span>Cart</span>
              {itemCount > 0 && (
                <span style={{
                  position: 'absolute', top: -8, right: -6,
                  background: '#fb641b', color: 'white',
                  width: 20, height: 20, borderRadius: '50%',
                  fontSize: 10, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid #2874f0',
                }}>{itemCount > 9 ? '9+' : itemCount}</span>
              )}
            </Link>

          </div>
        </div>
      </div>

      {/* ════════════ Category Strip ════════════ */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e0e0e0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }} className="hide-mobile">
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          display: 'flex', alignItems: 'center',
          padding: '0 16px', overflowX: 'auto',
        }}>
          <Link to="/products"
            style={{
              padding: '9px 16px', fontSize: 13, fontWeight: 600,
              color: '#2874f0', textDecoration: 'none', whiteSpace: 'nowrap',
              borderBottom: '2px solid #2874f0', flexShrink: 0,
            }}>
            All Products
          </Link>

          {CATEGORIES.map(({ label, slug, featured }) => (
            <Link
              key={label}
              to={featured ? '/products?featured=true' : `/products?category=${slug}`}
              style={{
                padding: '9px 16px', fontSize: 13, fontWeight: 500,
                color: '#212121', textDecoration: 'none',
                whiteSpace: 'nowrap', flexShrink: 0,
                borderBottom: '2px solid transparent',
                transition: 'color 0.15s, border-color 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#2874f0'; e.currentTarget.style.borderBottomColor = '#2874f0' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#212121'; e.currentTarget.style.borderBottomColor = 'transparent' }}>
              {label}
            </Link>
          ))}

          <Link to="/wishlist"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '9px 16px', fontSize: 13, fontWeight: 500,
              color: '#878787', textDecoration: 'none', whiteSpace: 'nowrap',
              flexShrink: 0, marginLeft: 'auto',
              borderBottom: '2px solid transparent',
              transition: 'color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#e91e63'; e.currentTarget.style.borderBottomColor = '#e91e63' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#878787'; e.currentTarget.style.borderBottomColor = 'transparent' }}>
            <Heart size={13} /> My Wishlist
            {wishlist.length > 0 && (
              <span style={{ background: '#e91e63', color: 'white', borderRadius: 99, fontSize: 9, fontWeight: 800, padding: '1px 6px', marginLeft: 2 }}>
                {wishlist.length}
              </span>
            )}
          </Link>
        </div>
      </div>

    </header>
  )
}
