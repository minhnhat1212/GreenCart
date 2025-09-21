import React, { useEffect, useState  } from 'react'
import { useAppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import toast from 'react-hot-toast'

const Orders = () => {
    const { formatCurrency, axios } = useAppContext()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState({})
    
    const fetchOrders = async () => {
        try {
            const { data } = await axios.get('/api/orders/seller');
            if (data.success) {
                setOrders(data.order)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    };

    // Đồng bộ trạng thái thanh toán
    const syncPaymentStatus = async (orderId) => {
        setLoading(prev => ({ ...prev, [orderId]: true }));
        try {
            const { data } = await axios.post(`/api/orders/${orderId}/sync-payment`);
            if (data.success) {
                toast.success(data.message);
                fetchOrders(); // Refresh danh sách đơn hàng
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Lỗi khi đồng bộ trạng thái thanh toán');
        } finally {
            setLoading(prev => ({ ...prev, [orderId]: false }));
        }
    };

    // Cập nhật trạng thái đơn hàng
    const updateOrderStatus = async (orderId, status) => {
        setLoading(prev => ({ ...prev, [`status_${orderId}`]: true }));
        try {
            const { data } = await axios.put(`/api/orders/${orderId}/status`, { status });
            if (data.success) {
                toast.success('Cập nhật trạng thái thành công');
                fetchOrders(); // Refresh danh sách đơn hàng
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Lỗi khi cập nhật trạng thái');
        } finally {
            setLoading(prev => ({ ...prev, [`status_${orderId}`]: false }));
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [])
    return (
      <div className='no-scrollbar flex-1 h-[95vh] overflow-y-scroll'>
        <div className="md:p-10 p-4 space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Đơn hàng</h2>
          
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <img className="w-24 h-24 mx-auto mb-4 opacity-50" src={assets.box_icon} alt="No orders" />
              <p className="text-gray-500 text-lg">Chưa có đơn hàng nào</p>
            </div>
          ) : (
            orders.map((order, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              {/* Header đơn hàng */}
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <img className="w-8 h-8" src={assets.box_icon} alt="boxIcon" />
                  <div>
                    <span className="text-lg font-medium text-gray-800">Đơn hàng #{order._id.slice(-6)}</span>
                    {order.userId && (
                      <p className="text-sm text-gray-500">Khách hàng: {order.userId.name || order.userId.email}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary">{formatCurrency(order.amount)}</p>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Nội dung đơn hàng */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sản phẩm */}
                <div className="lg:col-span-1">
                  <h4 className="font-medium text-gray-700 mb-3">Sản phẩm</h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-800 truncate">
                            {item.product?.name || "Sản phẩm đã bị xóa"}
                          </p>
                          <span className="text-primary text-sm font-medium">x{item.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Địa chỉ */}
                <div className="lg:col-span-1">
                  <h4 className="font-medium text-gray-700 mb-3">Địa chỉ giao hàng</h4>
                  <div className="space-y-1 text-gray-600">
                    <p className="font-medium text-gray-800">
                      {order.address.firstName} {order.address.lastName}
                    </p>
                    <p className="truncate" title={`${order.address.street}, ${order.address.city}`}>
                      {order.address.street.length > 25 
                        ? `${order.address.street.substring(0, 25)}...` 
                        : order.address.street}
                    </p>
                    <p className="truncate" title={`${order.address.city}, ${order.address.state}`}>
                      {order.address.city}, {order.address.state}
                    </p>
                    <p>{order.address.zipcode}, {order.address.country}</p>
                    <p className="font-medium text-gray-700">📞 {order.address.phone}</p>
                  </div>
                </div>

                {/* Thông tin thanh toán */}
                <div className="lg:col-span-1">
                  <h4 className="font-medium text-gray-700 mb-3">Thông tin thanh toán</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phương thức:</span>
                      <span className="font-medium">{order.paymentType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trạng thái:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.isPaid 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.isPaid ? "Đã thanh toán" : "Chờ thanh toán"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trạng thái đơn hàng:</span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {order.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tổng tiền:</span>
                      <span className="font-medium">{formatCurrency(order.amount)}</span>
                    </div>
                    
                    {/* Nút điều khiển */}
                    <div className="flex flex-col gap-2 mt-3">
                      {!order.isPaid && order.paymentType === "Online" && (
                        <button
                          onClick={() => syncPaymentStatus(order._id)}
                          disabled={loading[order._id]}
                          className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:opacity-50"
                        >
                          {loading[order._id] ? "Đang đồng bộ..." : "Đồng bộ thanh toán"}
                        </button>
                      )}
                      
                      <div className="flex gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          disabled={loading[`status_${order._id}`]}
                          className="px-2 py-1 border rounded text-xs flex-1"
                        >
                          <option value="Order Placed">Đặt hàng</option>
                          <option value="Processing">Đang xử lý</option>
                          <option value="Shipped">Đã gửi hàng</option>
                          <option value="Delivered">Đã giao hàng</option>
                          <option value="Cancelled">Đã hủy</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )))}
        </div>
      </div>
    )
}

export default Orders
