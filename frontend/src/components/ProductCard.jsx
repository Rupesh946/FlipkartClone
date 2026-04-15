import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, X, Heart } from 'lucide-react'
import toast from 'react-hot-toast'
import useCartStore from '../store/cartStore'
import useWishlistStore from '../store/wishlistStore'

const fmt = (p) => '₹' + Number(p).toLocaleString('en-IN')

const getFirstImage = (images) => {
  if (!images) return ''
  if (Array.isArray(images)) return images[0] || ''
  if (typeof images === 'string') return images.split(' ')[0] || ''
  return ''
}

export default function ProductCard({ product }) {
  const [adding,    setAdding]    = useState(false)
  const [hovered,   setHovered]   = useState(false)
  const [heartAnim, setHeartAnim] = useState(false)
  const [imgIdx,    setImgIdx]    = useState(0)

  const { addToCart }                    = useCartStore()
  const { toggleWishlist, isWishlisted } = useWishlistStore()

  const {
    id, name, price, original_price, discount_percent,
    rating, review_count, images, brand, is_featured,
  } = product

  // Build image list from whatever format the API sends
  const imgList = (() => {
    if (Array.isArray(images) && images.length) return images
    if (typeof images === 'string' && images.trim()) return images.split(' ').filter(Boolean)
    return []
  })()
  const currentImg = imgList[imgIdx] || ''

  // Try next image in list on error, then fall back to branded placeholder
  const handleImgError = (e) => {
    if (imgIdx < imgList.length - 1) {
      setImgIdx((i) => i + 1)
    } else {
      e.target.src = `https://placehold.co/300x300/f0f4ff/2874f0?text=${encodeURIComponent(brand || name.slice(0, 10) || 'Product')}`
      e.target.style.padding = '20px'
      e.target.style.objectFit = 'contain'
    }
  }
  const rNum      = parseFloat(rating)
  const rClass    = rNum >= 4 ? 'rating-high' : rNum >= 3 ? 'rating-mid' : 'rating-low'
  const wishlisted = isWishlisted(id)

  const handleAdd = async (e) => {
    e.preventDefault(); e.stopPropagation()
    if (adding) return
    setAdding(true)
    try {
      await addToCart(id)
      toast.success('Added to cart!')
    } catch (err) {
      toast.error(err.message || 'Failed')
    } finally {
      setAdding(false)
    }
  }

  const handleWishlist = (e) => {
    e.preventDefault(); e.stopPropagation()
    const added = toggleWishlist(product)
    setHeartAnim(true)
    setTimeout(() => setHeartAnim(false), 400)
    toast.success(added ? '❤️ Added to Wishlist!' : 'Removed from Wishlist', { duration: 1800 })
  }

  return (
    <Link
      to={`/products/${id}`}
      style={{ display: 'block', textDecoration: 'none', color: 'inherit', height: '100%' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        background: 'white', display: 'flex', flexDirection: 'column',
        height: '100%', position: 'relative',
        transition: 'transform 0.22s ease, box-shadow 0.22s ease',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.13)' : 'none',
      }}>

        {/* ── Image ── */}
        <div style={{ position: 'relative', paddingTop: '100%', background: '#fafafa', overflow: 'hidden' }}>
          <img
            src={currentImg}
            alt={name}
            loading="lazy"
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'contain', padding: 8,
              transition: 'transform 0.3s ease',
              transform: hovered ? 'scale(1.06)' : 'scale(1)',
            }}
            onError={handleImgError}
          />

          {/* Discount badge */}
          {discount_percent > 0 && (
            <div style={{
              position: 'absolute', top: 8, left: 8,
              background: '#388e3c', color: 'white',
              fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 3,
            }}>
              {discount_percent}% OFF
            </div>
          )}

          {/* Wishlist heart — always visible */}
          <button
            onClick={handleWishlist}
            className={`heart-btn ${heartAnim ? 'active' : ''}`}
            title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart
              size={16}
              style={{
                color: wishlisted ? '#e91e63' : '#bdbdbd',
                fill:  wishlisted ? '#e91e63' : 'transparent',
                transition: 'all 0.2s',
              }}
            />
          </button>

          {/* Featured ribbon */}
          {is_featured && (
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'linear-gradient(90deg, #ffc200, #faaf00)',
              color: '#212121', fontSize: 9, fontWeight: 800,
              padding: '3px 8px', textAlign: 'center', letterSpacing: '0.6px',
            }}>
              ★ FEATURED PICK
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div style={{ padding: '12px 12px 6px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {brand && (
            <div style={{ fontSize: 11, color: '#878787', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {brand}
            </div>
          )}
          <div style={{
            fontSize: 13, fontWeight: 500, color: '#212121',
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.45,
          }}>
            {name}
          </div>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span className={`rating ${rClass}`}>{rating} ★</span>
            <span style={{ fontSize: 11, color: '#878787' }}>({Number(review_count).toLocaleString('en-IN')})</span>
          </div>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 16, fontWeight: 700 }}>{fmt(price)}</span>
            {original_price && parseFloat(original_price) > parseFloat(price) && (
              <>
                <span style={{ fontSize: 12, color: '#878787', textDecoration: 'line-through' }}>{fmt(original_price)}</span>
                {discount_percent > 0 && (
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#388e3c' }}>{discount_percent}% off</span>
                )}
              </>
            )}
          </div>

          {/* Free delivery indicator */}
          {parseFloat(price) >= 499 && (
            <div style={{ fontSize: 11, color: '#388e3c', fontWeight: 500 }}>🚚 Free Delivery</div>
          )}
        </div>

        {/* ── Add to Cart hover button ── */}
        <div style={{
          padding: '0 10px 10px',
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0)' : 'translateY(6px)',
          transition: 'all 0.2s ease',
        }}>
          <button
            onClick={handleAdd}
            disabled={adding}
            style={{
              width: '100%', padding: '8px',
              background: adding ? '#ff9f00aa' : '#ff9f00',
              border: 'none', borderRadius: 4,
              color: 'white', fontSize: 12, fontWeight: 700,
              cursor: adding ? 'wait' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              transition: 'background 0.15s',
            }}
          >
            <ShoppingCart size={13} />
            {adding ? 'Adding…' : 'Add to Cart'}
          </button>
        </div>

      </div>
    </Link>
  )
}
