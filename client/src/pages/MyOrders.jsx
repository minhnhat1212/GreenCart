import React, { useEffect, useMemo, useState } from 'react'
import { useAppContext } from '../context/AppContext.jsx'

const BASE_STATUS_STEPS = [
  {
    value: 'Order Placed',
    label: 'Đặt hàng thành công',
    description: 'Chúng tôi đã nhận được đơn hàng của bạn và sẽ xử lý ngay.'
  },
  {
    value: 'Processing',
    label: 'Đang chuẩn bị',
    description: 'Kho đang đóng gói và sẵn sàng bàn giao cho đơn vị vận chuyển.'
  },
  {
    value: 'Shipped',
    label: 'Đang giao hàng',
    description: 'Đơn hàng đang trên đường đến với bạn.'
  },
  {
    value: 'Delivered',
    label: 'Đã giao hàng',
    description: 'Giao thành công, chúc bạn mua sắm vui vẻ!'
  }
]

const CANCELLED_STEP = {
  value: 'Cancelled',
  label: 'Đơn hàng đã hủy',
  description: 'Đơn hàng bị hủy theo yêu cầu hoặc do có sự cố trong quá trình xử lý.'
}

const formatDate = (dateString, withTime = false) => {
  if (!dateString) return '--'
  const options = withTime
    ? { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }
    : { day: '2-digit', month: '2-digit', year: 'numeric' }
  return new Date(dateString).toLocaleString('vi-VN', options)
}

const getEstimatedDelivery = (createdAt, delivered) => {
  if (!createdAt) return '--'
  if (delivered) return formatDate(createdAt)
  const created = new Date(createdAt)
  const eta = new Date(created.getTime() + 3 * 24 * 60 * 60 * 1000)
  return formatDate(eta)
}

const getStatusBadgeClasses = (status) => {
  switch (status) {
    case 'Delivered':
      return 'bg-green-100 text-green-700'
    case 'Shipped':
      return 'bg-sky-100 text-sky-700'
    case 'Processing':
      return 'bg-amber-100 text-amber-700'
    case 'Cancelled':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const MyOrders = () => {
  const [myOrder, setMyOrders] = useState([])
  const [confirming, setConfirming] = useState({})
  const { axios, user, formatCurrency } = useAppContext()

  const fetchMyOrders = async () => {
    try {
      const { data } = await axios.get('/api/orders/user')
      if (data.success) {
        setMyOrders(data.order)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (user) {
      fetchMyOrders()
    }
  }, [user])

  const handleConfirmDelivery = async (orderId) => {
    try {
      setConfirming((prev) => ({ ...prev, [orderId]: true }))
      const { data } = await axios.put(`/api/orders/${orderId}/confirm-delivery`)
      if (data.success && data.order) {
        setMyOrders((prev) => prev.map((order) => (order._id === orderId ? data.order : order)))
      }
    } catch (error) {
      console.log(error)
    } finally {
      setConfirming((prev) => ({ ...prev, [orderId]: false }))
    }
  }

  const timelineConfig = useMemo(
    () =>
      myOrder.reduce((acc, order) => {
        acc[order._id] =
          order.status === 'Cancelled'
            ? [...BASE_STATUS_STEPS.slice(0, 2), CANCELLED_STEP]
            : BASE_STATUS_STEPS
        return acc
      }, {}),
    [myOrder]
  )

  const renderTimeline = (order) => {
    const steps = timelineConfig[order._id] || BASE_STATUS_STEPS
    const currentIndex = steps.findIndex((step) => step.value === order.status)

    return (
      <div className='relative mt-4'>
        <div className='absolute left-5 top-0 bottom-0 border-l-2 border-dashed border-gray-200' aria-hidden='true'></div>
        <div className='space-y-6'>
          {steps.map((step, idx) => {
            const isActive = idx === currentIndex
            const isCompleted = idx < currentIndex && order.status !== 'Cancelled'
            return (
              <div key={step.value} className='relative pl-12'>
                <span
                  className={`absolute left-1 top-0 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white ${
                    isActive
                      ? 'border-primary bg-primary/10 text-primary'
                      : isCompleted
                        ? 'border-green-500 bg-green-50 text-green-600'
                        : 'border-gray-200 text-gray-400'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </span>
                <p className={`text-sm font-semibold ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>{step.label}</p>
                <p className='text-xs text-gray-500'>{step.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className='mt-16 pb-16'>
      <div className='mx-auto mb-12 flex w-max flex-col items-end'>
        <p className='text-2xl font-semibold uppercase text-gray-900'>Đơn hàng của tôi</p>
        <div className='mb-3 mt-2 h-0.5 w-16 rounded-full bg-primary'></div>
      </div>

      <div className='space-y-10'>
        {myOrder.map((order) => {
          const isPaidCOD = order.paymentType === 'COD'
          const delivered = order.status === 'Delivered'
          return (
            <div key={order._id} className='mx-auto max-w-6xl rounded-xl border border-gray-200 bg-white p-5 shadow-sm'>
              <div className='flex flex-col gap-3 text-sm text-gray-500 md:flex-row md:items-center md:justify-between'>
                <span>
                  Mã đơn hàng:{' '}
                  <span className='font-semibold uppercase tracking-wide text-gray-800'>{order._id.slice(-8)}</span>
                </span>
                <span>
                  Phương thức thanh toán: <span className='font-semibold text-gray-800'>{order.paymentType}</span>
                </span>
                <span>
                  Ngày đặt: <span className='font-semibold text-gray-800'>{formatDate(order.createdAt)}</span>
                </span>
              </div>

              <div className='mt-4 flex flex-wrap items-center gap-3 text-sm'>
                <div className='flex items-center gap-2'>
                  <span className='font-medium text-gray-600'>Trạng thái đơn hàng:</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClasses(order.status)}`}>
                    {order.status === 'Order Placed'
                      ? 'Đã đặt hàng'
                      : order.status === 'Processing'
                        ? 'Đang xử lý'
                        : order.status === 'Shipped'
                          ? 'Đang vận chuyển'
                          : order.status === 'Delivered'
                            ? 'Đã giao hàng'
                            : 'Đã hủy'}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='font-medium text-gray-600'>Thanh toán:</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      isPaidCOD ? 'bg-amber-100 text-amber-700' : order.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {isPaidCOD ? 'Thanh toán khi nhận hàng' : order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </span>
                </div>
              </div>

              <div className='mt-6 rounded-xl border border-gray-100 bg-gray-50 p-5'>
                <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                  <div>
                    <p className='text-base font-semibold text-gray-900'>Theo dõi tiến độ giao hàng</p>
                    <p className='text-xs text-gray-500'>
                      Cập nhật lần cuối: {order.updatedAt ? formatDate(order.updatedAt, true) : 'Đang tải...'}
                    </p>
                  </div>
                  <div className='text-right text-sm text-gray-600'>
                    <p>
                      Dự kiến giao:{' '}
                      <span className='font-semibold text-gray-900'>{getEstimatedDelivery(order.createdAt, delivered)}</span>
                    </p>
                    <p>
                      Tình trạng hiện tại: <span className='font-semibold text-gray-900'>{order.status}</span>
                    </p>
                  </div>
                  {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                    <button
                      onClick={() => handleConfirmDelivery(order._id)}
                      disabled={confirming[order._id]}
                      className='rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60'
                    >
                      {confirming[order._id] ? 'Đang xác nhận...' : 'Đã nhận được hàng'}
                    </button>
                  )}
                </div>
                {renderTimeline(order)}

                <div className='mt-6 grid gap-4 md:grid-cols-2'>
                  <div className='rounded-lg border border-white bg-white p-4 shadow-sm'>
                    <p className='text-sm font-semibold text-gray-700'>Địa chỉ giao hàng</p>
                    <p className='mt-1 text-sm text-gray-600'>
                      {order.address
                        ? `${order.address.firstName || ''} ${order.address.lastName || ''}`.trim()
                        : 'Chưa có thông tin'}
                    </p>
                    <p className='text-sm text-gray-600'>
                      {order.address
                        ? `${order.address.street}, ${order.address.city}, ${order.address.state}`
                        : 'Vui lòng cập nhật địa chỉ trong hồ sơ.'}
                    </p>
                    <p className='text-sm text-gray-600'>
                      {order.address ? `SĐT: ${order.address.phone}` : 'Không có số điện thoại'}
                    </p>
                  </div>

                  <div className='rounded-lg border border-white bg-white p-4 shadow-sm'>
                    <p className='text-sm font-semibold text-gray-700'>Chi tiết vận chuyển</p>
                    <div className='mt-2 space-y-2 text-sm text-gray-600'>
                      <p>
                        Đơn vị: <span className='font-medium text-gray-900'>GreenCart Express</span>
                      </p>
                      <p>
                        Mã tham chiếu vận chuyển:{' '}
                        <span className='font-mono text-gray-900'>#{order._id.slice(-6).toUpperCase()}</span>
                      </p>
                      <p>
                        Liên hệ hỗ trợ:{' '}
                        <a href='tel:19006363' className='font-medium text-primary'>
                          1900 63 63
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className='mt-6 divide-y divide-gray-100 rounded-xl border border-gray-100'>
                {order.items.map((item, idx) => (
                  <div
                    key={`${order._id}-${idx}`}
                    className='flex flex-col gap-4 bg-white p-4 text-gray-600 md:flex-row md:items-center md:justify-between'
                  >
                    <div className='flex items-center'>
                      <div className='rounded-lg bg-primary/10 p-3'>
                        <img
                          src={item.product?.image?.[0] || '/placeholder-image.png'}
                          alt={item.product?.name || 'Sản phẩm'}
                          className='h-16 w-16 rounded-md object-cover'
                        />
                      </div>
                      <div className='ml-4'>
                        <h3 className='text-lg font-semibold text-gray-900'>{item.product?.name || 'Sản phẩm đã bị xóa'}</h3>
                        <p className='text-sm text-gray-500'>Danh mục: {item.product?.category || 'N/A'}</p>
                      </div>
                    </div>
                    <div className='flex flex-col gap-2 text-sm text-gray-600 md:text-right'>
                      <p>
                        Số lượng: <span className='font-semibold text-gray-900'>{item.quantity || 1}</span>
                      </p>
                      <p>
                        Tình trạng: <span className='font-semibold text-gray-900'>{order.status}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className='mt-6 flex flex-col gap-3 text-right sm:items-end'>
                <div className='rounded-lg bg-primary/10 px-6 py-3 text-right'>
                  <span className='text-lg font-bold text-primary'>Tổng tiền: {formatCurrency(order.amount)}</span>
                </div>
                <p className='text-xs text-gray-500'>
                  Nếu cần hỗ trợ thêm, vui lòng liên hệ hotline hoặc gửi email đến support@greencart.vn
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MyOrders
