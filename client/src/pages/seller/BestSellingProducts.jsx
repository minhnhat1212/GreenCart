import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const BestSellingProducts = () => {
  const { formatCurrency } = useAppContext()
  const [bestSellingData, setBestSellingData] = useState({
    products: [],
    totalSales: 0,
    totalRevenue: 0
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7days') // 7days, 30days, 90days, 1year
  const [sortBy, setSortBy] = useState('quantity') // quantity, revenue

  const fetchBestSellingData = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(`/api/seller/best-selling?range=${timeRange}&sort=${sortBy}`)
      if (data.success) {
        setBestSellingData(data.data)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBestSellingData()
  }, [timeRange, sortBy])

  const timeRangeOptions = [
    { value: '7days', label: '7 ngày qua' },
    { value: '30days', label: '30 ngày qua' },
    { value: '90days', label: '90 ngày qua' },
    { value: '1year', label: '1 năm qua' }
  ]

  const sortOptions = [
    { value: 'quantity', label: 'Số lượng bán' },
    { value: 'revenue', label: 'Doanh thu' }
  ]

  if (loading) {
    return (
      <div className='flex items-center justify-center h-[60vh]'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-gray-600'>Đang tải dữ liệu sản phẩm bán chạy...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='p-6'>
      <div className='mb-8'>
        <h1 className='text-4xl font-bold text-gray-800 mb-2'>Sản phẩm bán chạy</h1>
        <p className='text-gray-600'>Theo dõi và phân tích sản phẩm bán chạy nhất</p>
      </div>

      {/* Filters */}
      <div className='mb-6 flex flex-wrap gap-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>Thời gian</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent'
          >
            {timeRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>Sắp xếp theo</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent'
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
        <div className='bg-white rounded-xl p-6 border border-gray-100 shadow-sm'>
          <div className='flex items-center justify-between mb-4'>
            <div className='w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white text-xl'>
              📦
            </div>
          </div>
          <h3 className='text-2xl font-bold text-gray-800 mb-1'>
            {bestSellingData.totalSales}
          </h3>
          <p className='text-gray-600 text-sm font-medium'>Tổng sản phẩm đã bán</p>
        </div>

        <div className='bg-white rounded-xl p-6 border border-gray-100 shadow-sm'>
          <div className='flex items-center justify-between mb-4'>
            <div className='w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl'>
              💰
            </div>
          </div>
          <h3 className='text-2xl font-bold text-gray-800 mb-1'>
            {formatCurrency(bestSellingData.totalRevenue)}
          </h3>
          <p className='text-gray-600 text-sm font-medium'>Tổng doanh thu</p>
        </div>
      </div>

      {/* Top Products Chart */}
      <div className='bg-white rounded-xl p-6 border border-gray-100 shadow-sm mb-8'>
        <h2 className='text-xl font-semibold text-gray-800 mb-4'>Top 10 sản phẩm bán chạy</h2>
        {bestSellingData.products && bestSellingData.products.length > 0 ? (
          <div className='h-64'>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bestSellingData.products.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'quantitySold' ? value.toLocaleString() : formatCurrency(value), 
                    name === 'quantitySold' ? 'Số lượng bán' : 'Doanh thu'
                  ]}
                  labelFormatter={(label) => `Sản phẩm: ${label}`}
                />
                <Bar 
                  dataKey={sortBy === 'revenue' ? 'revenue' : 'quantitySold'} 
                  fill="#8b5cf6" 
                  name={sortBy === 'revenue' ? 'revenue' : 'quantitySold'}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className='h-64 flex items-center justify-center text-gray-500'>
            <div className='text-center'>
              <div className='text-4xl mb-2'>📊</div>
              <p>Không có dữ liệu sản phẩm bán chạy</p>
              <p className='text-sm'>Trong khoảng thời gian được chọn</p>
            </div>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className='bg-white rounded-xl border border-gray-100 shadow-sm'>
        <div className='p-6 border-b border-gray-100'>
          <h2 className='text-xl font-semibold text-gray-800'>Danh sách sản phẩm bán chạy</h2>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Hạng
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Sản phẩm
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Số lượng bán
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Doanh thu
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Giá bán
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Tỷ lệ
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {bestSellingData.products && bestSellingData.products.length > 0 ? (
                bestSellingData.products.map((product, index) => (
                <tr key={product._id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    <div className='flex items-center'>
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index < 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {index + 1}
                      </span>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center'>
                      <div className='flex-shrink-0 h-12 w-12'>
                        <img
                          className='h-12 w-12 rounded-lg object-cover'
                          src={product.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzMkMxOC40NzcgMzIgMTQgMjcuNTIzIDE0IDIyUzE4LjQ3NyAxMiAyNCAxMlMzNCAxNi40NzcgMzQgMjJTMjkuNTIzIDMyIDI0IDMyWk0yNCAxNkMyMC42ODYgMTYgMTggMTguNjg2IDE4IDIyUzIwLjY4NiAyOCAyNCAyOFMzMCAyNS4zMTQgMzAgMjJTMjcuMzE0IDE2IDI0IDE2WiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMjQgMzZDMjIuMzQ0IDM2IDIxIDM0LjY1NiAyMSAzM0wyMSAyM0MyMSAyMS4zNDQgMjIuMzQ0IDIwIDI0IDIwUzI3IDIxLjM0NCAyNyAyM0wyNyAzM0MyNyAzNC42NTYgMjUuNjU2IDM2IDI0IDM2WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'}
                          alt={product.name || 'Sản phẩm không có tên'}
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzMkMxOC40NzcgMzIgMTQgMjcuNTIzIDE0IDIyUzE4LjQ3NyAxMiAyNCAxMlMzNCAxNi40NzcgMzQgMjJTMjkuNTIzIDMyIDI0IDMyWk0yNCAxNkMyMC42ODYgMTYgMTggMTguNjg2IDE4IDIyUzIwLjY4NiAyOCAyNCAyOFMzMCAyNS4zMTQgMzAgMjJTMjcuMzE0IDE2IDI0IDE2WiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMjQgMzZDMjIuMzQ0IDM2IDIxIDM0LjY1NiAyMSAzM0wyMSAyM0MyMSAyMS4zNDQgMjIuMzQ0IDIwIDI0IDIwUzI3IDIxLjM0NCAyNyAyM0wyNyAzM0MyNyAzNC42NTYgMjUuNjU2IDM2IDI0IDM2WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'
                          }}
                        />
                      </div>
                      <div className='ml-4'>
                        <div className='text-sm font-medium text-gray-900'>
                          {product.name || 'Sản phẩm không có tên'}
                        </div>
                        <div className='text-sm text-gray-500'>ID: {product._id}</div>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {product.quantitySold}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {formatCurrency(product.revenue)}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {product.price && !isNaN(product.price) ? formatCurrency(product.price) : 'N/A'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    <div className='flex items-center'>
                      <div className='w-16 bg-gray-200 rounded-full h-2 mr-2'>
                        <div
                          className='bg-primary h-2 rounded-full'
                          style={{ 
                            width: `${bestSellingData.products[0]?.quantitySold > 0 ? 
                              (product.quantitySold / bestSellingData.products[0].quantitySold) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                      <span className='text-xs text-gray-500'>
                        {bestSellingData.products[0]?.quantitySold > 0 ? 
                          ((product.quantitySold / bestSellingData.products[0].quantitySold) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </td>
                </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <div className="text-4xl mb-2">📦</div>
                      <p className="text-lg font-medium">Không có dữ liệu sản phẩm bán chạy</p>
                      <p className="text-sm">Trong khoảng thời gian được chọn</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default BestSellingProducts
