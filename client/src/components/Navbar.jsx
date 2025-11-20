import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets.js'
import { useAppContext } from '../context/AppContext.jsx'
import { useSettings } from '../context/SettingsContext.jsx'
import toast from 'react-hot-toast'

const Navbar = () => {
  const [open, setOpen] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const { user, setUser, setShowUserLogin, navigate, setSearchQuery, searchQuery, getCartCount, axios } = useAppContext();
  const { t } = useSettings();

  const logout = async () => {
    try {
      const { data } = await axios.get('/api/user/logout')
      if (data.success) {
        toast.success(data.message)
        setUser(null)
        navigate('/')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (searchQuery.length > 0) {
      navigate("/products")
    }
  }, [searchQuery])

  // tắt dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.dropdown-container')) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-5 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50 transition-all">

      {/* Logo */}
      <NavLink to="/" onClick={() => setOpen(false)}>
        <img className="h-10 md:h-12" src={assets.logo} alt="logo" />
      </NavLink>

      {/* Desktop Menu */}
      <div className="hidden sm:flex items-center gap-8 xl:gap-12">
        <NavLink to="/" className="text-base font-medium text-gray-700 hover:text-primary transition-colors">{t('home')}</NavLink>
        <NavLink to="/products" className="text-base font-medium text-gray-700 hover:text-primary transition-colors">{t('products')}</NavLink>
        <NavLink to="/promotions" className="text-base font-medium text-gray-700 hover:text-primary transition-colors">🎉 Ưu đãi</NavLink>
        <NavLink to="/contact" className="text-base font-medium text-gray-700 hover:text-primary transition-colors">{t('contact')}</NavLink>

        <div className="hidden lg:flex items-center text-sm gap-3 bg-gray-100 px-5 py-2.5 rounded-full hover:bg-gray-200 transition-colors w-64">
          <img src={assets.search_icon} alt="search" className="w-4 h-4 opacity-60" />
          <input
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent outline-none placeholder-gray-500 text-gray-700"
            type="text"
            placeholder={t('searchPlaceholder')}
          />
        </div>

        <div onClick={() => navigate("/cart")} className="relative cursor-pointer hover:scale-105 transition-transform">
          <img src={assets.nav_cart_icon} alt='cart' className='w-6 h-6 opacity-80' />
          <span className="absolute -top-1.5 -right-1.5 text-[10px] font-bold text-white bg-primary w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
            {getCartCount()}
          </span>
        </div>

        {!user ? (
          <button
            onClick={() => setShowUserLogin(true)}
            className="px-8 py-2.5 bg-primary hover:bg-primary-hover transition text-white rounded-full text-sm font-medium shadow-lg shadow-primary/30"
          >
            {t('login')}
          </button>
        ) : (
          <div className='relative dropdown-container'>
            <img
              src={user?.avatar || assets.profile_icon}
              alt='Profile'
              className='w-10 h-10 rounded-full object-cover cursor-pointer border-2 border-white shadow-md hover:shadow-lg transition-shadow'
              onClick={() => setShowDropdown(!showDropdown)}
              onError={(e) => {
                e.target.src = assets.profile_icon
              }}
            />
            {showDropdown && (
              <ul className='absolute top-14 right-0 bg-white shadow-xl border border-gray-100 py-2 w-48 rounded-xl text-sm z-40 overflow-hidden animate-fade-in'>
                <li onClick={() => { navigate("/profile"); setShowDropdown(false) }} className='px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-gray-700 transition-colors'>{t('profile')}</li>
                <li onClick={() => { navigate("/my-orders"); setShowDropdown(false) }} className='px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-gray-700 transition-colors'>{t('orders')}</li>
                <li onClick={() => { navigate("/settings"); setShowDropdown(false) }} className='px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-gray-700 transition-colors'>{t('settings')}</li>
                <li onClick={() => { logout(); setShowDropdown(false) }} className='px-4 py-3 hover:bg-red-50 text-red-500 cursor-pointer flex items-center gap-2 transition-colors'>{t('logout')}</li>
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Menu Icon for Mobile */}
      <button onClick={() => setOpen(!open)} className="sm:hidden p-2 rounded-md hover:bg-gray-100 transition-colors">
        <img src={assets.menu_icon} alt="menu" className="w-6 h-6" />
      </button>

      {/* Mobile Menu */}
      {open && (
        <div className="sm:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-md shadow-lg py-6 flex flex-col items-start gap-1 px-6 text-base z-50 border-t border-gray-100">
          <NavLink to="/" onClick={() => setOpen(false)} className="w-full py-3 border-b border-gray-100 text-gray-700">{t('home')}</NavLink>
          <NavLink to="/products" onClick={() => setOpen(false)} className="w-full py-3 border-b border-gray-100 text-gray-700">{t('products')}</NavLink>
          <NavLink to="/promotions" onClick={() => setOpen(false)} className="w-full py-3 border-b border-gray-100 text-gray-700">🎉 Ưu đãi</NavLink>
          {user && (
            <>
              <NavLink to="/profile" onClick={() => setOpen(false)} className="w-full py-3 border-b border-gray-100 text-gray-700">{t('profile')}</NavLink>
              <NavLink to="/my-orders" onClick={() => setOpen(false)} className="w-full py-3 border-b border-gray-100 text-gray-700">{t('orders')}</NavLink>
              <NavLink to="/settings" onClick={() => setOpen(false)} className="w-full py-3 border-b border-gray-100 text-gray-700">{t('settings')}</NavLink>
            </>
          )}
          <NavLink to="/contact" onClick={() => setOpen(false)} className="w-full py-3 border-b border-gray-100 text-gray-700">{t('contact')}</NavLink>
          {!user ? (
            <button
              onClick={() => {
                setOpen(false)
                setShowUserLogin(true)
              }}
              className="w-full py-3 mt-4 bg-primary hover:bg-primary-hover transition text-white rounded-lg text-base font-medium shadow-md"
            >
              {t('login')}
            </button>
          ) : (
            <button
              onClick={logout}
              className="w-full py-3 mt-4 bg-gray-100 hover:bg-gray-200 transition text-gray-700 rounded-lg text-base font-medium"
            >
              {t('logout')}
            </button>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar
