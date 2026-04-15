import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ShoppingCart, ShoppingBag, ChevronLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import useCartStore from '../store/cartStore'
import ProductCard from '../components/ProductCard'
import api from '../api/axios'

const fmt = (p) => '₹' + Number(p).toLocaleString('en-IN')

const getFirstImage = (images) => {
  if (!images) return ''
  if (Array.isArray(images)) return images[0] || ''
  if (typeof images === 'string') return images.split(' ')[0] || ''
  return ''
}

const HIGHLIGHTS = [
  { icon: '🚚', text: 'Free Delivery' },
  { icon: '↩️', text: '7-Day Return' },
  { icon: '🔒', text: 'Secure Pay' },
  { icon: '✅', text: '100% Genuine' },
]

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct]       = useState(null)
  const [related, setRelated]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [selectedImg, setSelectedImg] = useState(0)
  const [quantity, setQuantity]     = useState(1)
  const [adding, setAdding]         = useState(false)
  const { addToCart } = useCartStore()

  useEffect(() => {
    setLoading(true)
    setProduct(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })

    api.get(`/products/${id}`)
      .then(async (res) => {
        setProduct(res.data)
        setSelectedImg(0)
        setQuantity(1)
        if (res.data.category_slug) {
          const r = await api.get(`/products?category=${res.data.category_slug}&limit=5`)
          setRelated(r.data.products.filter((p) => p.id !== parseInt(id)))
        }
      })
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = async () => {
    if (adding) return
    setAdding(true)
    try {
      await addToCart(product.id, quantity)
      toast.success(`Added ${quantity > 1 ? `${quantity}×` : ''} item to cart!`)
    } catch (err) {
      toast.error(err.message || 'Failed')
    } finally {
      setAdding(false)
    }
  }

  const handleBuyNow = async () => {
    await handleAddToCart()
    navigate('/cart')
  }

  if (loading) return (
    <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="spinner" />
    </div>
  )
  if (!product) return null

  const {
    name, price, original_price, discount_percent,
    rating, review_count, images = [], brand,
    description, specifications = {}, stock,
    category_name, category_slug,
  } = product

  const imgs = (() => {
    if (Array.isArray(images) && images.length) return images
    if (typeof images === 'string' && images.trim()) return images.split(' ')
    return [`https://placehold.co/400x400/f5f5f5/878787?text=${encodeURIComponent(name)}`]
  })()

  const rNum = parseFloat(rating)
  const rClass = rNum >= 4 ? 'rating-high' : rNum >= 3 ? 'rating-mid' : 'rating-low'

  const specs = (() => {
    try {
      return typeof specifications === 'string' ? JSON.parse(specifications) : (specifications || {})
    } catch { return {} }
  })()

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 16 }}>

        {/* ── Breadcrumb ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: 13, color: '#878787', flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: '#2874f0' }}>Home</Link>
          <span>/</span>
          <Link to={`/products?category=${category_slug}`} style={{ color: '#2874f0' }}>{category_name}</Link>
          <span>/</span>
          <span style={{ color: '#212121', fontWeight: 500 }} className="hide-mobile">
            {name.length > 50 ? name.slice(0, 50) + '…' : name}
          </span>
        </div>

        {/* ── Main Card ── */}
        <div className="product-detail-grid" style={{
          background: 'white', borderRadius: 4,
          padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        }}>
          {/* Left — Images */}
          <div>
            {/* Main image */}
            <div style={{
              border: '1px solid #e0e0e0', borderRadius: 8,
              overflow: 'hidden', marginBottom: 12,
              background: '#fafafa', position: 'relative',
            }}>
              <img
                src={imgs[selectedImg]}
                alt={name}
                style={{ width: '100%', height: 380, objectFit: 'contain', padding: 16 }}
                onError={(e) => {
                  // Try next image in list, else show branded placeholder
                  const nextIdx = selectedImg + 1
                  if (nextIdx < imgs.length && imgs[nextIdx] !== imgs[selectedImg]) {
                    setSelectedImg(nextIdx)
                  } else {
                    e.target.src = `https://placehold.co/400x380/f0f4ff/2874f0?text=${encodeURIComponent(brand || name.slice(0, 12))}`
                  }
                }}
              />
              {discount_percent > 0 && (
                <div style={{
                  position: 'absolute', top: 12, left: 12,
                  background: '#388e3c', color: 'white',
                  fontSize: 12, fontWeight: 800,
                  padding: '4px 10px', borderRadius: 3,
                }}>
                  {discount_percent}% OFF
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {imgs.length > 1 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {imgs.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedImg(i)}
                    style={{
                      width: 68, height: 68, borderRadius: 6, overflow: 'hidden',
                      border: `2px solid ${selectedImg === i ? '#2874f0' : '#e0e0e0'}`,
                      cursor: 'pointer', padding: 4, background: '#fafafa',
                      transition: 'border-color 0.15s',
                    }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      onError={(e) => { e.target.src = 'https://placehold.co/60x60' }} />
                  </div>
                ))}
              </div>
            )}

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button
                className="btn btn-secondary btn-lg"
                style={{ flex: 1 }}
                onClick={handleAddToCart}
                disabled={adding || stock === 0}
              >
                <ShoppingCart size={18} />
                {adding ? 'Adding…' : stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button
                className="btn btn-primary btn-lg"
                style={{ flex: 1 }}
                onClick={handleBuyNow}
                disabled={adding || stock === 0}
              >
                <ShoppingBag size={18} />
                Buy Now
              </button>
            </div>
          </div>

          {/* Right — Info */}
          <div>
            {brand && (
              <Link
                to={`/products?search=${encodeURIComponent(brand)}`}
                style={{ fontSize: 13, color: '#2874f0', fontWeight: 600, letterSpacing: '0.3px' }}
              >
                {brand}
              </Link>
            )}
            <h1 style={{ fontSize: 20, fontWeight: 600, color: '#212121', margin: '8px 0 14px', lineHeight: 1.4 }}>
              {name}
            </h1>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <span className={`rating ${rClass}`} style={{ fontSize: 14 }}>{rating} ★</span>
              <span style={{ fontSize: 13, color: '#878787' }}>
                {Number(review_count).toLocaleString('en-IN')} ratings & reviews
              </span>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', marginBottom: 18 }} />

            {/* Price */}
            <div style={{ marginBottom: 22 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 28, fontWeight: 700 }}>{fmt(price)}</span>
                {parseFloat(original_price) > parseFloat(price) && (
                  <span style={{ fontSize: 16, color: '#878787', textDecoration: 'line-through' }}>
                    {fmt(original_price)}
                  </span>
                )}
                {discount_percent > 0 && (
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#388e3c' }}>{discount_percent}% off</span>
                )}
              </div>
              <p style={{ fontSize: 12, color: '#388e3c', marginTop: 4, fontWeight: 500 }}>
                Inclusive of all taxes
              </p>
            </div>

            {/* Availability */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#878787' }}>Availability:</span>
              <span style={{
                fontSize: 14, fontWeight: 600,
                color: stock > 20 ? '#388e3c' : stock > 0 ? '#f57c00' : '#d32f2f',
              }}>
                {stock > 20 ? '✓ In Stock' : stock > 0 ? `⚠ Only ${stock} left!` : '✗ Out of Stock'}
              </span>
            </div>

            {/* Quantity */}
            {stock > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#878787' }}>Quantity:</span>
                <div className="qty-control">
                  <button className="qty-btn" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1}>−</button>
                  <div className="qty-value">{quantity}</div>
                  <button className="qty-btn" onClick={() => setQuantity((q) => Math.min(stock, q + 1))} disabled={quantity >= stock}>+</button>
                </div>
                {quantity > 1 && (
                  <span style={{ fontSize: 13, color: '#878787' }}>× {fmt(price)} = <strong>{fmt(parseFloat(price) * quantity)}</strong></span>
                )}
              </div>
            )}

            {/* Description */}
            {description && (
              <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: 8, marginBottom: 20 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#212121', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</h3>
                <p style={{ fontSize: 13, color: '#4a4a4a', lineHeight: 1.75 }}>{description}</p>
              </div>
            )}

            {/* Highlights */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 10, padding: '14px 0',
              borderTop: '1px solid #f0f0f0',
            }}>
              {HIGHLIGHTS.map((h) => (
                <div key={h.text} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: 12, color: '#4a4a4a', fontWeight: 500,
                }}>
                  <span style={{ fontSize: 18 }}>{h.icon}</span> {h.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Specifications ── */}
        {Object.keys(specs).length > 0 && (
          <div style={{
            background: 'white', marginTop: 12, borderRadius: 4,
            padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Specifications</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {Object.entries(specs).map(([key, val], i) => (
                  <tr key={key} style={{ background: i % 2 === 0 ? '#f8f9fa' : 'white' }}>
                    <td style={{
                      padding: '11px 16px', fontSize: 13,
                      color: '#878787', fontWeight: 600,
                      width: '32%', borderBottom: '1px solid #f0f0f0',
                    }}>{key}</td>
                    <td style={{
                      padding: '11px 16px', fontSize: 13,
                      color: '#212121', borderBottom: '1px solid #f0f0f0',
                    }}>{String(val)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Related Products ── */}
        {related.length > 0 && (
          <div style={{
            background: 'white', marginTop: 12,
            borderRadius: 4, overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          }}>
            <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid #eeeeee' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Similar Products</h2>
            </div>
            <div className="product-grid">
              {related.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
