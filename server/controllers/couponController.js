import Coupon from '../models/Coupon.js';

// Tạo mã giảm giá
export const createCoupon = async (req, res) => {
    try {
        const { code, discount, minAmount, maxDiscount, expiryDate, usageLimit } = req.body;
        
        // Đảm bảo expiryDate được convert sang Date object
        const expiryDateObj = expiryDate ? new Date(expiryDate) : null;
        if (expiryDateObj && isNaN(expiryDateObj.getTime())) {
            return res.json({ success: false, message: "Ngày hết hạn không hợp lệ" });
        }
        
        const coupon = new Coupon({
            code: code.toUpperCase(),
            discount: Number(discount),
            minAmount: Number(minAmount) || 0,
            maxDiscount: Number(maxDiscount) || 0,
            expiryDate: expiryDateObj,
            usageLimit: Number(usageLimit) || 1
        });

        await coupon.save();
        res.json({ success: true, message: "Mã giảm giá đã được tạo thành công" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Lấy danh sách mã giảm giá
export const getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json({ success: true, coupons });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Kiểm tra và áp dụng mã giảm giá
export const applyCoupon = async (req, res) => {
    try {
        const { code, amount } = req.body;
        
        const coupon = await Coupon.findOne({ 
            code: code.toUpperCase(),
            isActive: true,
            expiryDate: { $gt: new Date() }
        });

        if (!coupon) {
            return res.json({ success: false, message: "Mã giảm giá không hợp lệ hoặc đã hết hạn" });
        }

        if (coupon.usedCount >= coupon.usageLimit) {
            return res.json({ success: false, message: "Mã giảm giá đã hết lượt sử dụng" });
        }

        if (amount < coupon.minAmount) {
            return res.json({ success: false, message: `Đơn hàng tối thiểu ${coupon.minAmount}đ để sử dụng mã này` });
        }

        let discountAmount = (amount * coupon.discount) / 100;
        if (coupon.maxDiscount > 0 && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
        }

        res.json({ 
            success: true, 
            discount: discountAmount,
            coupon: {
                code: coupon.code,
                discount: coupon.discount,
                discountAmount
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Sử dụng mã giảm giá (tăng usedCount)
export const useCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        
        await Coupon.findOneAndUpdate(
            { code: code.toUpperCase() },
            { $inc: { usedCount: 1 } }
        );

        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Lấy danh sách mã giảm giá có sẵn cho user (chỉ lấy active, chưa hết hạn, chưa hết lượt)
export const getAvailableCoupons = async (req, res) => {
    try {
        const now = new Date();
        
        // Lấy tất cả mã active (không filter date trong query để tránh vấn đề timezone)
        const allCoupons = await Coupon.find({
            isActive: true
        }).sort({ createdAt: -1 });
        
        console.log(`Found ${allCoupons.length} active coupons`);
        
        // Filter trong code để kiểm tra chính xác hơn
        const availableCoupons = allCoupons.filter(coupon => {
            // Kiểm tra chưa hết hạn
            const expiryDate = new Date(coupon.expiryDate);
            // Set về cuối ngày để đảm bảo cả ngày hôm đó vẫn còn hiệu lực
            expiryDate.setHours(23, 59, 59, 999);
            
            const isExpired = expiryDate < now;
            if (isExpired) {
                console.log(`Coupon ${coupon.code} is expired. Expiry: ${expiryDate}, Now: ${now}`);
                return false; // Đã hết hạn
            }
            
            // Kiểm tra chưa hết lượt sử dụng
            const usedCount = coupon.usedCount || 0;
            const usageLimit = coupon.usageLimit || 0;
            // Nếu usageLimit = 0, coi như không giới hạn
            if (usageLimit > 0 && usedCount >= usageLimit) {
                console.log(`Coupon ${coupon.code} is used up. Used: ${usedCount}, Limit: ${usageLimit}`);
                return false; // Đã hết lượt sử dụng
            }
            
            console.log(`Coupon ${coupon.code} is available. Expiry: ${expiryDate}, Used: ${usedCount}/${usageLimit}`);
            return true;
        });
        
        console.log(`Returning ${availableCoupons.length} available coupons`);
        res.json({ success: true, coupons: availableCoupons || [] });
    } catch (error) {
        console.error('Error in getAvailableCoupons:', error);
        res.json({ success: false, message: error.message, coupons: [] });
    }
};