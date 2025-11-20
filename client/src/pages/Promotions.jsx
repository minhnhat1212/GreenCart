import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Promotions = () => {
  const { axios, formatCurrency } = useAppContext();
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAvailableCoupons = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/coupon/available');
      if (data.success) {
        // Không có mã giảm giá là trường hợp bình thường, không cần hiển thị lỗi
        setCoupons(data.coupons || []);
      } else {
        // Chỉ hiển thị lỗi nếu có message cụ thể
        if (data.message) {
          toast.error(data.message);
        }
        setCoupons([]);
      }
    } catch (error) {
      // Chỉ hiển thị lỗi nếu có lỗi network hoặc server
      console.error('Error fetching coupons:', error);
      // Không hiển thị toast lỗi, chỉ log để debug
      // Nếu là lỗi 404 hoặc không có dữ liệu, coi như không có mã giảm giá
      if (error.response && error.response.status !== 404) {
        toast.error('Có lỗi xảy ra khi tải mã giảm giá');
      }
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableCoupons();
  }, []);

  const copyCouponCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã copy mã ${code}!`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] mt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải mã giảm giá...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 pb-16">
      {/* Header Section */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">🎉 Mã Giảm Giá</h1>
        <p className="text-lg text-gray-600 mb-6">Ưu đãi đặc biệt dành riêng cho bạn!</p>
        <div className="mx-auto mb-3 h-1 w-24 rounded-full bg-primary"></div>
      </div>

      {/* Coupons Grid */}
      {coupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <div className="text-6xl mb-4">🎁</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Hiện chưa có mã giảm giá nào</h2>
            <p className="text-gray-500 mb-6">Hãy quay lại sau để nhận những ưu đãi tuyệt vời!</p>
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-3 bg-primary text-white font-medium rounded-full hover:bg-primary-dull transition"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => {
            const daysRemaining = getDaysRemaining(coupon.expiryDate);
            const isExpiringSoon = daysRemaining <= 3;

            return (
              <div
                key={coupon._id}
                className={`relative bg-gradient-to-br from-primary/10 via-primary/5 to-white rounded-2xl border-2 border-primary/20 p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 ${
                  isExpiringSoon ? 'ring-2 ring-red-400' : ''
                }`}
              >
                {/* Badge */}
                {isExpiringSoon && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Sắp hết hạn!
                  </div>
                )}

                {/* Discount Percentage */}
                <div className="text-center mb-4">
                  <div className="inline-block bg-primary/20 rounded-full px-6 py-3 mb-3">
                    <span className="text-4xl font-bold text-primary">{coupon.discount}%</span>
                    <span className="text-lg text-gray-700 ml-1">OFF</span>
                  </div>
                </div>

                {/* Coupon Code */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Mã giảm giá:</label>
                  <div className="flex items-center gap-2 bg-white border-2 border-dashed border-primary/40 rounded-lg p-3">
                    <code className="flex-1 text-xl font-bold text-primary tracking-wider text-center">
                      {coupon.code}
                    </code>
                    <button
                      onClick={() => copyCouponCode(coupon.code)}
                      className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dull transition"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {/* Conditions */}
                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  {coupon.minAmount > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Đơn hàng tối thiểu: <strong>{formatCurrency(coupon.minAmount)}</strong></span>
                    </div>
                  )}
                  {coupon.maxDiscount > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Giảm tối đa: <strong>{formatCurrency(coupon.maxDiscount)}</strong></span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Còn lại: <strong>{coupon.usageLimit - coupon.usedCount}</strong> lượt sử dụng</span>
                  </div>
                </div>

                {/* Expiry Date */}
                <div className="mb-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    Hết hạn: <span className="font-semibold text-gray-700">{formatDate(coupon.expiryDate)}</span>
                    {daysRemaining > 0 && (
                      <span className="block mt-1 text-primary font-medium">
                        (Còn {daysRemaining} ngày)
                      </span>
                    )}
                  </p>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => {
                    navigate('/cart');
                    toast.success(`Mã ${coupon.code} đã được copy!`);
                    setTimeout(() => {
                      copyCouponCode(coupon.code);
                    }, 100);
                  }}
                  className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dull transition transform hover:scale-105"
                >
                  Sử dụng ngay
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Section */}
      {coupons.length > 0 && (
        <div className="mt-12 bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">📝 Hướng dẫn sử dụng:</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Chọn mã giảm giá bạn muốn sử dụng</li>
            <li>Click "Sử dụng ngay" hoặc "Copy" để lấy mã</li>
            <li>Vào giỏ hàng và nhập mã giảm giá khi thanh toán</li>
            <li>Đảm bảo đơn hàng đạt giá trị tối thiểu (nếu có)</li>
            <li>Mỗi mã chỉ có thể sử dụng một số lần nhất định</li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default Promotions;

