import { Link } from 'react-router-dom'
import { ShoppingCart, Trash2, Heart } from 'lucide-react'
import toast from 'react-hot-toast'
import useWishlistStore from '../store/wishlistStore'
import useCartStore from '../store/cartStore'
import ProductCard from '../components/ProductCard'

const fmt = (p) => '₹' + Number(p).toLocaleString('en-IN')

const getFirstImage = (images) => {
  if (!images) return ''
  if (Array.isArray(images)) return images[0] || ''
  if (typeof images === 'string') return images.split(' ')[0] || ''
  return ''
}

export default function WishlistPage() {
  const { items, removeFromWishlist } = useWishlistStore()
  const { addToCart } = useCartStore()

  const handleMoveToCart = async (item) => {
    try {
      await addToCart(item.id)
      removeFromWishlist(item.id)
      toast.success('Moved to Cart!')
    } catch (err) {
      toast.error(err.message || 'Failed')
    }
  }

  /* ── Empty ── */
  if (items.length === 0) return (
    <div className="page">
      <div className="container" style={{ paddingTop: 32 }}>
        <div style={{ background: 'white', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          <div className="empty-state">
            <div style={{ fontSize: 72 }}>💔</div>
            <h3>Your Wishlist is empty</h3>
            <p>Save items you love — click the ♡ on any product</p>
            <Link to="/products" className="btn btn-primary btn-lg">Explore Products</Link>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 20 }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 16, flexWrap: 'wrap', gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Heart size={24} style={{ color: '#e91e63', fill: '#e91e63' }} />
            <h1 style={{ fontSize: 20, fontWeight: 700 }}>My Wishlist</h1>
            <span style={{
              background: '#fce4ec', color: '#e91e63',
              fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
            }}>{items.length} item{items.length !== 1 ? 's' : ''}</span>
          </div>
          <Link to="/products" style={{ fontSize: 13, color: '#2874f0', fontWeight: 600 }}>
            + Add More Items
          </Link>
        </div>

        {/* Wishlist Grid — use ProductCard but also show a "Move to Cart" strip */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* ── Row view for wishlist items ── */}
          <div style={{ background: 'white', borderRadius: 4, boxShadow: '0 1px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            {items.map((item, idx) => (
              <div key={item.id} style={{
                display: 'flex', gap: 16, padding: '18px 20px', alignItems: 'flex-start',
                borderBottom: idx < items.length - 1 ? '1px solid #f0f0f0' : 'none',
                transition: 'background 0.15s',
              }}>
                {/* Image */}
                <Link to={`/products/${item.id}`} style={{ flexShrink: 0 }}>
                  <div style={{
                    width: 110, height: 110, border: '1px solid #e0e0e0',
                    borderRadius: 8, overflow: 'hidden', padding: 6,
                    background: '#fafafa',
                  }}>
                    <img
                      src={getFirstImage(item.images)}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      onError={(e) => { e.target.src = 'https://placehold.co/104x104/f5f5f5' }}
                    />
                  </div>
                </Link>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {item.brand && (
                    <p style={{ fontSize: 11, color: '#878787', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>{item.brand}</p>
                  )}
                  <Link to={`/products/${item.id}`} style={{ textDecoration: 'none' }}>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#212121', lineHeight: 1.45, marginBottom: 8 }}>
                      {item.name}
                    </p>
                  </Link>

                  {/* Price */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
                    <span style={{ fontSize: 20, fontWeight: 700 }}>{fmt(item.price)}</span>
                    {parseFloat(item.original_price) > parseFloat(item.price) && (
                      <>
                        <span style={{ fontSize: 13, color: '#878787', textDecoration: 'line-through' }}>{fmt(item.original_price)}</span>
                        {item.discount_percent > 0 && (
                          <span style={{ fontSize: 13, color: '#388e3c', fontWeight: 700 }}>{item.discount_percent}% off</span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleMoveToCart(item)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '9px 20px', background: '#fb641b',
                        border: 'none', borderRadius: 4, color: 'white',
                        fontWeight: 700, fontSize: 13, cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#e05510')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#fb641b')}
                    >
                      <ShoppingCart size={15} /> Move to Cart
                    </button>
                    <button
                      onClick={() => { removeFromWishlist(item.id); toast.success('Removed') }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '9px 16px', border: '1px solid #e0e0e0',
                        borderRadius: 4, background: 'none', color: '#878787',
                        fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#d32f2f'; e.currentTarget.style.color = '#d32f2f' }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e0e0e0'; e.currentTarget.style.color = '#878787' }}
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Similar Products section ── */}
          <div style={{ background: 'white', borderRadius: 4, boxShadow: '0 1px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid #f0f0f0' }}>
              <h2 style={{ fontSize: 17, fontWeight: 700 }}>You Might Also Like</h2>
            </div>
            <div className="product-grid">
              {items.slice(0, 4).map((item) => (
                <ProductCard key={`similar-${item.id}`} product={item} />
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
