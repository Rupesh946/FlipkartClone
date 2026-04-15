import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'

const COLUMNS = {
  About: ['About Us', 'Careers', 'Press', 'Flipkart Stories', 'Wholesale'],
  Help:  ['Payments', 'Shipping', 'Cancellation & Returns', 'FAQ', 'Report Infringement'],
  Policy: ['Return Policy', 'Terms of Use', 'Security', 'Privacy', 'Sitemap'],
  Social: ['Facebook', 'Twitter', 'YouTube', 'Instagram'],
}

const S = {
  footer:   { background: '#172337', color: '#878787', padding: '40px 0 24px', marginTop: 32 },
  inner:    { maxWidth: 1280, margin: '0 auto', padding: '0 16px' },
  grid:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 28, marginBottom: 36 },
  heading:  { color: '#637696', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 },
  links:    { display: 'flex', flexDirection: 'column', gap: 10 },
  link:     { fontSize: 13, color: '#aab4c5', cursor: 'pointer', transition: 'color 0.15s' },
  divider:  { height: 1, background: '#253148', margin: '0 0 20px' },
  bottom:   { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, color: '#637696', flexWrap: 'wrap' },
  address:  { fontSize: 12, color: '#aab4c5', lineHeight: 1.8 },
}

const QUICK_LINKS = [
  { to: '/',                  label: 'Home'           },
  { to: '/products',          label: 'All Products'   },
  { to: '/products?category=electronics', label: 'Electronics' },
  { to: '/products?category=fashion',     label: 'Fashion'     },
  { to: '/cart',              label: 'My Cart'         },
  { to: '/orders',            label: 'My Orders'       },
]

export default function Footer() {
  return (
    <footer style={S.footer}>
      <div style={S.inner}>
        <div style={S.grid}>
          {Object.entries(COLUMNS).map(([cat, items]) => (
            <div key={cat}>
              <div style={S.heading}>{cat}</div>
              <div style={S.links}>
                {items.map((item) => (
                  <a
                    key={item}
                    href="#"
                    style={S.link}
                    onMouseEnter={(e) => (e.target.style.color = '#2874f0')}
                    onMouseLeave={(e) => (e.target.style.color = '#aab4c5')}
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
          ))}

          <div>
            <div style={S.heading}>Quick Links</div>
            <div style={S.links}>
              {QUICK_LINKS.map((l) => (
                <Link
                  key={l.label}
                  to={l.to}
                  style={S.link}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#2874f0')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#aab4c5')}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div style={S.heading}>Registered Office</div>
            <p style={S.address}>
              Flipkart Internet Pvt Ltd,<br />
              Buildings Alyssa, Begonia<br />
              & Clove Embassy Tech Village,<br />
              Outer Ring Road, Devarabeesanahalli,<br />
              Bengaluru 560103, Karnataka.
            </p>
          </div>
        </div>

        <div style={S.divider} />
        <div style={S.bottom}>
          <span>Made with</span>
          <Heart size={13} style={{ color: '#e53935', fill: '#e53935' }} />
          <span>in India</span>
          <span style={{ margin: '0 4px' }}>|</span>
          <span>© {new Date().getFullYear()} Flipkart Clone. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}
