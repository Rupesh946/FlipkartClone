import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Package, CheckCircle, Clock, Truck, XCircle, ShoppingBag } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import useCartStore from '../store/cartStore'

const fmt     = (p) => '₹' + Number(p).toLocaleString('en-IN')
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

const getFirstImage = (images) => {
  if (!images) return ''
  if (Array.isArray(images)) return images[0] || ''
  if (typeof images === 'string') return images.split(' ')[0] || ''
  return ''
}

const STATUS_ICON = {
  placed:    <Clock     size={12} />,
  shipped:   <Truck     size={12} />,
  delivered: <CheckCircle size={12} />,
  cancelled: <XCircle   size={12} />,
}

export default function OrdersPage() {
  const [tab,           setTab]           = useState('checkout')
  const [orders,        setOrders]        = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [placing,       setPlacing]       = useState(false)
  const [success,       setSuccess]       = useState(null)
  const { items, itemCount, subtotal, fetchCart } = useCartStore()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    shipping_name:    'John Doe',
    shipping_address: '123 Main Street, Mumbai, Maharashtra 400001',
    shipping_phone:   '9876543210',
    payment_method:   'COD',
  })

  useEffect(() => { fetchCart() }, [fetchCart])

  useEffect(() => {
    if (tab === 'history') loadOrders()
  }, [tab])

  const loadOrders = async () => {
    setOrdersLoading(true)
    try {
      const { data } = await api.get('/orders')
      setOrders(data)
    } catch {
      toast.error('Failed to load orders')
    } finally {
      setOrdersLoading(false)
    }
  }

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    if (items.length === 0) { toast.error('Your cart is empty!'); return }
    setPlacing(true)
    try {
      const { data } = await api.post('/orders', form)
      setSuccess(data)
      fetchCart()
      toast.success('Order placed! 🎉')
    } catch (err) {
      toast.error(err.message || 'Failed to place order')
    } finally {
      setPlacing(false)
    }
  }

  /* ── Success Screen ── */
  if (success) return (
    <div className="page">
      <div className="container" style={{ paddingTop: 48 }}>
        <div style={{
          maxWidth: 520, margin: '0 auto',
          background: 'white', borderRadius: 12,
          padding: '48px 36px', boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
          textAlign: 'center', animation: 'popIn 0.4s ease',
        }}>
          <div style={{
            width: 84, height: 84,
            background: '#e8f5e9', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <CheckCircle size={48} style={{ color: '#388e3c' }} />
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#212121', marginBottom: 6 }}>
            Order Placed Successfully!
          </h2>
          <p style={{ fontSize: 14, color: '#878787', marginBottom: 28 }}>
            Order #{success.id} confirmed • {fmtDate(success.created_at)}
          </p>

          <div style={{
            background: '#f8f9fa', borderRadius: 8,
            padding: '16px 20px', marginBottom: 28, textAlign: 'left',
          }}>
            {[
              ['Total',    fmt(success.total_amount)],
              ['Payment',  success.payment_method],
              ['Items',    `${success.items?.length} item(s)`],
              ['Deliver to', success.shipping_name],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #eeeeee' }}>
                <span style={{ fontSize: 13, color: '#878787' }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{val}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={() => { setSuccess(null); setTab('history'); loadOrders() }}
            >
              <Package size={16} /> View My Orders
            </button>
            <Link to="/" className="btn btn-outline">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 16 }}>

        {/* ── Tabs ── */}
        <div style={{
          display: 'flex', background: 'white',
          borderRadius: 4, overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)', marginBottom: 16,
        }}>
          {[
            { key: 'checkout', label: 'Checkout',  icon: <ShoppingBag size={16} /> },
            { key: 'history',  label: 'My Orders', icon: <Package     size={16} /> },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1, padding: '15px 20px', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontSize: 14, fontWeight: 600,
                background: tab === t.key ? 'white' : '#f5f5f5',
                color: tab === t.key ? '#2874f0' : '#878787',
                borderBottom: tab === t.key ? '3px solid #2874f0' : '3px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              {t.icon} {t.label}
              {t.key === 'checkout' && itemCount > 0 && (
                <span style={{
                  background: '#fb641b', color: 'white',
                  borderRadius: 99, fontSize: 10, fontWeight: 800,
                  padding: '1px 7px',
                }}>{itemCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Checkout Tab ── */}
        {tab === 'checkout' && (
          <div className="checkout-layout">
            {/* Form */}
            <div style={{
              background: 'white', borderRadius: 4,
              padding: '24px 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 22 }}>Delivery Details</h2>
              <form onSubmit={handlePlaceOrder}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    className="form-input" name="shipping_name"
                    value={form.shipping_name} onChange={handleChange}
                    required placeholder="Enter your full name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Delivery Address *</label>
                  <textarea
                    className="form-input" name="shipping_address"
                    value={form.shipping_address} onChange={handleChange}
                    required rows={3} placeholder="House no., Street, Area, City, State, PIN"
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    className="form-input" name="shipping_phone"
                    value={form.shipping_phone} onChange={handleChange}
                    placeholder="10-digit mobile number" type="tel"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select className="form-input" name="payment_method" value={form.payment_method} onChange={handleChange}>
                    <option value="COD">💵 Cash on Delivery (COD)</option>
                    <option value="UPI">📱 UPI</option>
                    <option value="NetBanking">🏦 Net Banking</option>
                    <option value="Card">💳 Credit / Debit Card</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn btn-secondary btn-full btn-lg"
                  disabled={placing || items.length === 0}
                  style={{ marginTop: 8 }}
                >
                  {placing
                    ? 'Placing Order…'
                    : items.length === 0
                    ? 'Cart is Empty'
                    : `Place Order • ${fmt(subtotal)}`}
                </button>

                {items.length === 0 && (
                  <p style={{ fontSize: 12, color: '#d32f2f', textAlign: 'center', marginTop: 10 }}>
                    Your cart is empty.{' '}
                    <Link to="/products" style={{ color: '#2874f0' }}>Add items first →</Link>
                  </p>
                )}
              </form>
            </div>

            {/* Order Summary Sidebar */}
            <div style={{
              background: 'white', borderRadius: 4, overflow: 'hidden',
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)', position: 'sticky', top: 80,
            }}>
              <div style={{ background: '#f5f5f5', padding: '13px 20px', borderBottom: '1px solid #e0e0e0' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#878787', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  Order Summary
                </span>
              </div>
              <div style={{ padding: 20 }}>
                {items.length === 0 ? (
                  <p style={{ color: '#878787', fontSize: 13, textAlign: 'center', padding: '12px 0' }}>
                    No items in cart
                  </p>
                ) : (
                  <>
                    {items.map((item) => (
                      <div key={item.product_id} style={{
                        display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center',
                      }}>
                        <div style={{
                          width: 46, height: 46, border: '1px solid #e0e0e0',
                          borderRadius: 4, overflow: 'hidden', flexShrink: 0, padding: 2,
                        }}>
                          <img
                            src={getFirstImage(item.images)}
                            alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            onError={(e) => { e.target.src = 'https://placehold.co/44' }}
                          />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            fontSize: 12, color: '#212121', fontWeight: 500,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>{item.name}</p>
                          <p style={{ fontSize: 11, color: '#878787' }}>Qty: {item.quantity} × {fmt(item.price)}</p>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                          {fmt(parseFloat(item.price) * item.quantity)}
                        </span>
                      </div>
                    ))}

                    <div style={{ height: 1, background: '#e0e0e0', margin: '14px 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700 }}>
                      <span>Total</span>
                      <span>{fmt(subtotal)}</span>
                    </div>

                    <p style={{ fontSize: 11, color: '#388e3c', marginTop: 6, fontWeight: 500 }}>
                      {subtotal >= 499 ? '✓ Free delivery on this order' : `Add ₹${499 - subtotal} more for free delivery`}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── History Tab ── */}
        {tab === 'history' && (
          ordersLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div className="spinner" />
            </div>
          ) : orders.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 4, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
              <div className="empty-state">
                <Package size={80} style={{ color: '#e0e0e0' }} />
                <h3>No orders yet</h3>
                <p>Orders you place will appear here</p>
                <button className="btn btn-primary" onClick={() => setTab('checkout')}>
                  Place Your First Order
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {orders.map((order) => (
                <div key={order.id} style={{
                  background: 'white', borderRadius: 4,
                  padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                  animation: 'fadeIn 0.3s ease',
                }}>
                  {/* Header */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    marginBottom: 16, flexWrap: 'wrap', gap: 8,
                  }}>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>Order #{order.id}</span>
                      <span style={{ fontSize: 12, color: '#878787', marginLeft: 12 }}>
                        {fmtDate(order.created_at)}
                      </span>
                      <p style={{ fontSize: 12, color: '#878787', marginTop: 4 }}>
                        via {order.payment_method}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span className={`status-badge status-${order.status}`}>
                        {STATUS_ICON[order.status] || <Clock size={12} />} {order.status}
                      </span>
                      <span style={{ fontSize: 17, fontWeight: 700 }}>{fmt(order.total_amount)}</span>
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{
                    display: 'flex', flexDirection: 'column', gap: 10,
                    paddingTop: 14, borderTop: '1px solid #f0f0f0',
                  }}>
                    {order.items?.map((item) => (
                      <div key={item.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{
                          width: 56, height: 56, border: '1px solid #e0e0e0',
                          borderRadius: 6, overflow: 'hidden', flexShrink: 0, padding: 3,
                        }}>
                          <img
                            src={item.product_image || 'https://placehold.co/54'}
                            alt={item.product_name}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            onError={(e) => { e.target.src = 'https://placehold.co/54' }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 13, fontWeight: 500 }}>{item.product_name}</p>
                          <p style={{ fontSize: 12, color: '#878787' }}>
                            Qty: {item.quantity} × {fmt(item.price)}
                          </p>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                          {fmt(parseFloat(item.price) * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Shipping info */}
                  <div style={{
                    marginTop: 14, padding: '10px 14px',
                    background: '#f8f9fa', borderRadius: 6,
                  }}>
                    <p style={{ fontSize: 12, color: '#878787' }}>
                      <strong style={{ color: '#212121' }}>Deliver to:</strong>{' '}
                      {order.shipping_name} — {order.shipping_address}
                      {order.shipping_phone && ` • ${order.shipping_phone}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}
