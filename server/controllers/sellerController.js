
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';

export const sellerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

    if (password === process.env.SELLER_PASSWORD && email === process.env.SELLER_EMAIL)
    {
        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('sellerToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, 
        });
        return res.json({ success: true, message: "Logged In" });
    } else {
        return res.json({ success: false, message: "Invalid Credentails" });
    }
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

//check Auth api/seller/is-auth
export const isSellerAuth = async (req, res) => {
    try {

        return res.json({ success: true});
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

//logput //api/seller/logout
export const sellerLogout = async (req, res) => { 
    try {
        res.clearCookie('sellerToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        return res.json({success:true,message:"Logged Out"})
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Dashboard stats api/seller/dashboard-stats
export const getDashboardStats = async (req, res) => {
    try {
        // Đếm tổng users
        const totalUsers = await User.countDocuments();
        
        // Đếm tổng products (không bao gồm đã xóa)
        const totalProducts = await Product.countDocuments({ isDeleted: { $ne: true } });
        
        // Tính tổng doanh thu từ các đơn hàng đã thanh toán
        const revenueResult = await Order.aggregate([
            {
                $match: {
                    $or: [
                        { paymentType: "COD" },
                        { isPaid: true }
                    ]
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$amount" },
                    totalOrders: { $sum: 1 }
                }
            }
        ]);
        
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
        const totalOrders = revenueResult.length > 0 ? revenueResult[0].totalOrders : 0;
        
        // Đếm tổng coupons
        const totalCoupons = await Coupon.countDocuments();
        
        const stats = {
            totalUsers,
            totalProducts,
            totalRevenue,
            totalOrders,
            totalCoupons
        };
        
        res.json({ success: true, stats });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Revenue stats api/seller/revenue-stats
export const getRevenueStats = async (req, res) => {
    try {
        const { range } = req.query;
        let startDate = new Date();
        
        // Calculate start date based on range
        switch (range) {
            case '7days':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case '30days':
                startDate.setDate(startDate.getDate() - 30);
                break;
            case '90days':
                startDate.setDate(startDate.getDate() - 90);
                break;
            case '1year':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            default:
                startDate.setDate(startDate.getDate() - 7);
        }

        // Get daily revenue data
        const dailyRevenue = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    $or: [
                        { paymentType: "COD" },
                        { isPaid: true }
                    ]
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    revenue: { $sum: "$amount" },
                    orders: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Get monthly revenue data
        const monthlyRevenue = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    $or: [
                        { paymentType: "COD" },
                        { isPaid: true }
                    ]
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m", date: "$createdAt" }
                    },
                    revenue: { $sum: "$amount" },
                    orders: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Calculate totals
        const totalRevenue = dailyRevenue.reduce((sum, day) => sum + day.revenue, 0);
        const totalOrders = dailyRevenue.reduce((sum, day) => sum + day.orders, 0);
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Format daily revenue data
        const formattedDailyRevenue = dailyRevenue.map(day => ({
            date: day._id,
            revenue: day.revenue,
            orders: day.orders,
            averageValue: day.orders > 0 ? day.revenue / day.orders : 0
        }));

        res.json({
            success: true,
            data: {
                dailyRevenue: formattedDailyRevenue,
                monthlyRevenue,
                totalRevenue,
                totalOrders,
                averageOrderValue
            }
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Best selling products api/seller/best-selling
export const getBestSellingProducts = async (req, res) => {
    try {
        const { range, sort } = req.query;
        let startDate = new Date();
        
        // Calculate start date based on range
        switch (range) {
            case '7days':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case '30days':
                startDate.setDate(startDate.getDate() - 30);
                break;
            case '90days':
                startDate.setDate(startDate.getDate() - 90);
                break;
            case '1year':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            default:
                startDate.setDate(startDate.getDate() - 7);
        }

        // Get best selling products
        const bestSellingProducts = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    $or: [
                        { paymentType: "COD" },
                        { isPaid: true }
                    ]
                }
            },
            { $unwind: "$items" },
            {
                $addFields: {
                    "items.productObjectId": {
                        $toObjectId: "$items.product"
                    }
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "items.productObjectId",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            {
                $addFields: {
                    productDetails: { $arrayElemAt: ["$productDetails", 0] }
                }
            },
            {
                $match: {
                    productDetails: { $ne: null },
                    "productDetails.isDeleted": { $ne: true }
                }
            },
            {
                $group: {
                    _id: "$items.product",
                    quantitySold: { $sum: "$items.quantity" },
                    revenue: { $sum: { $multiply: ["$items.quantity", "$productDetails.offerPrice"] } },
                    name: { $first: "$productDetails.name" },
                    image: { $first: { $arrayElemAt: ["$productDetails.image", 0] } },
                    price: { $first: "$productDetails.offerPrice" }
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    image: 1,
                    price: 1,
                    quantitySold: 1,
                    revenue: 1
                }
            },
            {
                $sort: sort === 'revenue' ? { revenue: -1 } : { quantitySold: -1 }
            },
            { $limit: 50 }
        ]);

        // Calculate totals
        const totalSales = bestSellingProducts.reduce((sum, product) => sum + product.quantitySold, 0);
        const totalRevenue = bestSellingProducts.reduce((sum, product) => sum + product.revenue, 0);

        res.json({
            success: true,
            data: {
                products: bestSellingProducts,
                totalSales,
                totalRevenue
            }
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
