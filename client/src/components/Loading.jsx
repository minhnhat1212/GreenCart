import React from 'react'
import { useAppContext } from '../context/AppContext'
import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'

const Loading = () => {

    const { navigate, fetchUser } = useAppContext()
    let { search } = useLocation()
    const query = new URLSearchParams(search)
    const nextUrl = query.get('next');

    useEffect(() => {
        // Refresh user data để đồng bộ giỏ hàng sau khi thanh toán Stripe thành công
        // Webhook sẽ xóa giỏ hàng trên server, fetchUser sẽ sync lại với client
        if (nextUrl) {
            // Refresh user data sau một khoảng thời gian ngắn để đợi webhook xử lý
            const refreshTimer = setTimeout(() => {
                fetchUser();
            }, 2000);
            
            const navigateTimer = setTimeout(() => {
                navigate(`/${nextUrl}`)
            }, 5000);
            
            return () => {
                clearTimeout(refreshTimer);
                clearTimeout(navigateTimer);
            };
        }
    },[nextUrl, fetchUser, navigate])

  return (
    <div className='flex justify-center items-center h-screen'>
      <div className='animate-spin rounded-full h-24 w-24 border-4 border-gray-300 border-t-primary'></div>
    </div>
  )
}

export default Loading
