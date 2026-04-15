import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import api from '../api/axios'

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts]   = useState([])
  const [categories, setCategories] = useState([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const LIMIT = 20
  const category = searchParams.get('category') || ''
  const search   = searchParams.get('search')   || ''
  const featured = searchParams.get('featured') || ''

  const buildParams = (offset = 0) => {
    const p = new URLSearchParams({ limit: LIMIT, offset })
    if (category) p.set('category', category)
    if (search)   p.set('search',   search)
    if (featured) p.set('featured', featured)
    return p.toString()
  }

  useEffect(() => {
    api.get('/products/categories/all')
      .then((r) => setCategories(r.data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    setProducts([])
    api.get(`/products?${buildParams(0)}`)
      .then((r) => { setProducts(r.data.products); setTotal(r.data.total) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [category, search, featured])

  const loadMore = async () => {
    setLoadingMore(true)
    try {
      const r = await api.get(`/products?${buildParams(products.length)}`)
      setProducts((prev) => [...prev, ...r.data.products])
    } finally {
      setLoadingMore(false)
    }
  }

  const setFilter = (params) => setSearchParams(params)

  const activeCategory = categories.find((c) => c.slug === category)
  const pageTitle = search
    ? `Results for "${search}"`
    : featured === 'true'
    ? '⚡ Featured Products'
    : activeCategory
    ? activeCategory.name
    : 'All Products'

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 16 }}>

        {/* ── Filter Chips ── */}
        <div style={{
          background: 'white', padding: '14px 16px',
          borderRadius: 4, marginBottom: 12,
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          overflowX: 'auto',
        }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', minWidth: 'max-content' }}>
            <SlidersHorizontal size={15} style={{ color: '#878787', flexShrink: 0 }} />

            <button
              className={`chip ${!category && !featured ? 'active' : ''}`}
              onClick={() => setFilter({})}
            >
              All
            </button>

            <button
              className={`chip ${featured === 'true' ? 'active' : ''}`}
              onClick={() => setFilter({ featured: 'true' })}
            >
              ⚡ Featured
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`chip ${category === cat.slug ? 'active' : ''}`}
                onClick={() => setFilter({ category: cat.slug })}
              >
                {cat.name}
                <span style={{ fontSize: 10, color: 'inherit', opacity: 0.7 }}>({cat.product_count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, padding: '0 2px' }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700 }}>{pageTitle}</h1>
            {!loading && (
              <p style={{ fontSize: 12, color: '#878787', marginTop: 2 }}>
                {total} product{total !== 1 ? 's' : ''} found
              </p>
            )}
          </div>
          {search && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setFilter({})}
            >
              Clear search
            </button>
          )}
        </div>

        {/* ── Grid ── */}
        {loading ? (
          <div style={{ background: 'white', borderRadius: 4, padding: 60, display: 'flex', justifyContent: 'center' }}>
            <div className="spinner" />
          </div>
        ) : products.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 4, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
            <div className="empty-state">
              <div style={{ fontSize: 64 }}>🔍</div>
              <h3>No products found</h3>
              <p>Try a different search term or browse all categories</p>
              <button className="btn btn-primary" onClick={() => setFilter({})}>Browse All</button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ background: 'white', borderRadius: 4, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
              <div className="product-grid">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>

            {products.length < total && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
                <button
                  className="btn btn-outline"
                  onClick={loadMore}
                  disabled={loadingMore}
                  style={{ padding: '12px 36px' }}
                >
                  {loadingMore ? 'Loading…' : `Load More (${total - products.length} remaining)`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
