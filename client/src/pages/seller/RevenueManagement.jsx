import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

const RevenueManagement = () => {
  const { formatCurrency } = useAppContext()
  const [revenueData, setRevenueData] = useState({
    dailyRevenue: [],
    monthlyRevenue: [],
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7days') // 7days, 30days, 90days, 1year

  const fetchRevenueData = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(`/api/seller/revenue-stats?range=${timeRange}`)
      if (data.success) {
        setRevenueData(data.data)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRevenueData()
  }, [timeRange])

  const timeRangeOptions = [
    { value: '7days', label: '7 ngày qua' },
    { value: '30days', label: '30 ngày qua' },
    { value: '90days', label: '90 ngày qua' },
    { value: '1year', label: '1 năm qua' }
  ]

  if (loading) {
    return (
      <div className='flex items-center justify-center h-[60vh]'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-gray-600'>Đang tải dữ liệu doanh thu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='p-6'>
      <div className='mb-8'>
        <h1 className='text-4xl font-bold text-gray-800 mb-2'>Quản lý doanh thu</h1>
        <p className='text-gray-600'>Theo dõi và phân tích doanh thu của cửa hàng</p>
      </div>

      {/* Time Range Selector */}
      <div className='mb-6'>
        <div className='flex gap-2 flex-wrap'>
          {timeRangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeRange(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === option.value
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue Overview Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
        <div className='bg-white rounded-xl p-6 border border-gray-100 shadow-sm'>
          <div className='flex items-center justify-between mb-4'>
            <div className='w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl'>
              💰
            </div>
          </div>
          <h3 className='text-2xl font-bold text-gray-800 mb-1'>
            {formatCurrency(revenueData.totalRevenue)}
          </h3>
          <p className='text-gray-600 text-sm font-medium'>Tổng doanh thu</p>
        </div>

        <div className='bg-white rounded-xl p-6 border border-gray-100 shadow-sm'>
          <div className='flex items-center justify-between mb-4'>
            <div className='w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl'>
              🛒
            </div>
          </div>
          <h3 className='text-2xl font-bold text-gray-800 mb-1'>
            {revenueData.totalOrders}
          </h3>
          <p className='text-gray-600 text-sm font-medium'>Tổng đơn hàng</p>
        </div>

        <div className='bg-white rounded-xl p-6 border border-gray-100 shadow-sm'>
          <div className='flex items-center justify-between mb-4'>
            <div className='w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xl'>
              📊
            </div>
          </div>
          <h3 className='text-2xl font-bold text-gray-800 mb-1'>
            {formatCurrency(revenueData.averageOrderValue)}
          </h3>
          <p className='text-gray-600 text-sm font-medium'>Giá trị đơn hàng TB</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className='bg-white rounded-xl p-6 border border-gray-100 shadow-sm mb-8'>
        <h2 className='text-xl font-semibold text-gray-800 mb-4'>Biểu đồ doanh thu</h2>
        {revenueData.dailyRevenue && revenueData.dailyRevenue.length > 0 ? (
          <div className='h-64'>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData.dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip 
                  formatter={(value, name) => [formatCurrency(value), name === 'revenue' ? 'Doanh thu' : 'Đơn hàng']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('vi-VN')}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className='h-64 flex items-center justify-center text-gray-500'>
            <div className='text-center'>
              <div className='text-4xl mb-2'>📈</div>
              <p>Không có dữ liệu doanh thu</p>
              <p className='text-sm'>Trong khoảng thời gian được chọn</p>
            </div>
          </div>
        )}
      </div>

      {/* Revenue Table */}
      <div className='bg-white rounded-xl border border-gray-100 shadow-sm'>
        <div className='p-6 border-b border-gray-100'>
          <h2 className='text-xl font-semibold text-gray-800'>Chi tiết doanh thu</h2>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Ngày
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Doanh thu
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Số đơn hàng
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Giá trị TB
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {revenueData.dailyRevenue.map((item, index) => (
                <tr key={index} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {new Date(item.date).toLocaleDateString('vi-VN')}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {formatCurrency(item.revenue)}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {item.orders}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {formatCurrency(item.averageValue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default RevenueManagement
