import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, ShoppingBag, ArrowLeft, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'
import useCartStore from '../store/cartStore'

const fmt = (p) => '₹' + Number(p).toLocaleString('en-IN')

const getFirstImage = (images) => {
  if (!images) return ''
  if (Array.isArray(images)) return images[0] || ''
  if (typeof images === 'string') return images.split(' ')[0] || ''
  return ''
}

export default function CartPage() {
  const { items, itemCount, subtotal, loading, fetchCart, updateQuantity, removeFromCart } = useCartStore()
  const navigate = useNavigate()

  useEffect(() => { fetchCart() }, [fetchCart])

  const handleQty = async (productId, qty) => {
    try {
      await updateQuantity(productId, qty)
      if (qty <= 0) toast.success('Item removed')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(productId)
      toast.success('Item removed')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const delivery  = subtotal >= 499 ? 0 : 49
  const total     = subtotal + delivery
  const savings   = items.reduce((acc, item) => {
    const orig = parseFloat(item.original_price) || parseFloat(item.price)
    return acc + (orig - parseFloat(item.price)) * item.quantity
  }, 0)

  /* ── Empty ── */
  if (!loading && items.length === 0) return (
    <div className="page">
      <div className="container" style={{ paddingTop: 24 }}>
        <div style={{
          background: 'white', borderRadius: 8,
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        }}>
          <div className="empty-state">
            <ShoppingCart size={84} style={{ color: '#e0e0e0' }} />
            <h3>Your cart is empty!</h3>
            <p>Add items to it now</p>
            <Link to="/products" className="btn btn-primary btn-lg">Shop Now</Link>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) return (
    <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="spinner" />
    </div>
  )

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 14 }}>
          My Cart <span style={{ fontSize: 15, color: '#878787', fontWeight: 400 }}>({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
        </h1>

        <div className="cart-layout">

          {/* ── Items ── */}
          <div style={{ background: 'white', borderRadius: 4, boxShadow: '0 1px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            {items.map((item, idx) => (
              <div
                key={item.product_id}
                style={{
                  padding: '20px 24px',
                  borderBottom: idx < items.length - 1 ? '1px solid #f0f0f0' : 'none',
                  animation: 'fadeIn 0.3s ease',
                }}
              >
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  {/* Thumb */}
                  <Link to={`/products/${item.product_id}`}>
                    <div style={{
                      width: 108, height: 108, flexShrink: 0,
                      border: '1px solid #e0e0e0', borderRadius: 6,
                      padding: 4, background: '#fafafa', overflow: 'hidden',
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
                    <Link to={`/products/${item.product_id}`} style={{ textDecoration: 'none' }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#212121', marginBottom: 3, lineHeight: 1.4 }}>
                        {item.name}
                      </p>
                    </Link>
                    {item.brand && (
                      <p style={{ fontSize: 12, color: '#878787', marginBottom: 10 }}>{item.brand}</p>
                    )}

                    {/* Price row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 18, fontWeight: 700 }}>{fmt(item.price)}</span>
                      {parseFloat(item.original_price) > parseFloat(item.price) && (
                        <>
                          <span style={{ fontSize: 13, color: '#878787', textDecoration: 'line-through' }}>{fmt(item.original_price)}</span>
                          {item.discount_percent > 0 && (
                            <span style={{ fontSize: 13, color: '#388e3c', fontWeight: 600 }}>{item.discount_percent}% off</span>
                          )}
                        </>
                      )}
                    </div>

                    {/* Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                      <div className="qty-control">
                        <button
                          className="qty-btn"
                          onClick={() => handleQty(item.product_id, item.quantity - 1)}
                        >−</button>
                        <div className="qty-value">{item.quantity}</div>
                        <button
                          className="qty-btn"
                          onClick={() => handleQty(item.product_id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                        >+</button>
                      </div>

                      <button
                        onClick={() => handleRemove(item.product_id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 5,
                          padding: '6px 10px', border: 'none', background: 'none',
                          color: '#d32f2f', fontSize: 13, cursor: 'pointer',
                          fontWeight: 500, borderRadius: 4, transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#ffebee')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>

                  {/* Line Total */}
                  <div style={{ flexShrink: 0, textAlign: 'right' }} className="hide-mobile">
                    <p style={{ fontSize: 15, fontWeight: 700 }}>{fmt(parseFloat(item.price) * item.quantity)}</p>
                    {item.quantity > 1 && (
                      <p style={{ fontSize: 11, color: '#878787', marginTop: 2 }}>{item.quantity} × {fmt(item.price)}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Bottom CTA */}
            <div style={{
              padding: '16px 24px',
              borderTop: '2px solid #e0e0e0',
              background: '#fafafa',
              display: 'flex', justifyContent: 'flex-end',
            }}>
              <button
                className="btn btn-secondary"
                style={{ padding: '13px 40px', fontSize: 15 }}
                onClick={() => navigate('/orders')}
              >
                <ShoppingBag size={18} /> Place Order
              </button>
            </div>
          </div>

          {/* ── Order Summary ── */}
          <div style={{
            background: 'white', borderRadius: 4, overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            position: 'sticky', top: 80,
          }}>
            <div style={{ background: '#f5f5f5', padding: '13px 20px', borderBottom: '1px solid #e0e0e0' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#878787', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Price Details</span>
            </div>

            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span>Price ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                {savings > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#388e3c' }}>
                    <span>Discount</span>
                    <span>− {fmt(savings)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span>Delivery Charges</span>
                  {delivery === 0
                    ? <span style={{ color: '#388e3c', fontWeight: 600 }}>FREE</span>
                    : <span>{fmt(delivery)}</span>
                  }
                </div>

                <div style={{ height: '1px', borderTop: '1px dashed #e0e0e0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700 }}>
                  <span>Total Amount</span>
                  <span>{fmt(total)}</span>
                </div>

                {savings > 0 && (
                  <div style={{
                    background: '#e8f5e9', color: '#388e3c',
                    padding: '8px 12px', borderRadius: 6,
                    fontSize: 13, fontWeight: 600,
                  }}>
                    🎉 You'll save {fmt(savings)} on this order!
                  </div>
                )}
              </div>

              <button
                className="btn btn-secondary btn-full"
                style={{ marginTop: 20, padding: '13px', fontSize: 15 }}
                onClick={() => navigate('/orders')}
              >
                Proceed to Checkout
              </button>

              <Link
                to="/products"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  marginTop: 14, fontSize: 13, color: '#2874f0', fontWeight: 500,
                }}
              >
                <ArrowLeft size={13} /> Continue Shopping
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
