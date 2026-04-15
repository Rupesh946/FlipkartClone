import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import ProductsPage from './pages/ProductsPage'
import ProductDetail from './pages/ProductDetail'
import CartPage from './pages/CartPage'
import OrdersPage from './pages/OrdersPage'
import WishlistPage from './pages/WishlistPage'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2500,
          style: {
            fontFamily: "'Inter', sans-serif",
            fontSize: '14px',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          },
          success: { iconTheme: { primary: '#388e3c', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#d32f2f', secondary: '#fff' } },
        }}
      />
      <Navbar />
      <main style={{ paddingTop: 'var(--navbar-height)' }}>
        <Routes>
          <Route path="/"            element={<Home />}          />
          <Route path="/products"    element={<ProductsPage />}  />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart"        element={<CartPage />}       />
          <Route path="/orders"      element={<OrdersPage />}     />
          <Route path="/wishlist"    element={<WishlistPage />}   />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  )
}
