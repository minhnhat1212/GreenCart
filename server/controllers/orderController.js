import { response } from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import stripe from "stripe";
import User from '../models/User.js'
import axios from 'axios';
import Coupon from '../models/Coupon.js';

// place order cod api/order/cod
export const placeOrderCOD = async (req, res) => {
    try {
        const userId = req.userId;
        const { items, address, couponCode, discount } = req.body;
        if (!address || items.length === 0) {
            return res.json({success : false , message : "invalid data"})
        }
        let amount = await items.reduce(async(acc, item) => {
            const product = await Product.findById(item.product);
            return (await acc) + product.offerPrice * item.quantity;
        }, 0)
      //  amount += Math.floor(amount * 0.02);
        
        // Trừ discount nếu có
        if (discount && discount > 0) {
            amount -= discount;
        }

        const order = await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "COD",
            couponCode: couponCode || null,
            discount: discount || 0
        });

        // Cập nhật số lần sử dụng coupon trực tiếp
        if (couponCode) {
            await Coupon.findOneAndUpdate(
                { code: couponCode.toUpperCase() },
                { $inc: { usedCount: 1 } }
            );
        }

        return res.json({success:true,message : " Đặt hàng thành công"})
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const placeOrderStripe = async (req, res) => {
    try {
        const userId = req.userId;
        const { items, address, couponCode, discount } = req.body;

        const origin = req.headers.origin || "https://localhost:4000" || 'https://green-cart-dusky-five.vercel.app';

        if (!address || !items || items.length === 0) {
            return res.json({ success: false, message: "Dữ liệu không hợp lệ." });
        }

        let productData = [];
        let amount = 0;

        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.json({ success: false, message: "Sản phẩm không tồn tại." });
            }

            productData.push({
                name: product.name,
                price: product.offerPrice,
                quantity: item.quantity,
            });

            amount += product.offerPrice * item.quantity;
        }

        // Cộng thêm phí xử lý 2%
    //    amount += Math.floor(amount * 0.02);
        
        // Trừ discount nếu có
        if (discount && discount > 0) {
            amount -= discount;
        }

        const order = await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "Online",
            couponCode: couponCode || null,
            discount: discount || 0
        });

        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

        const line_items = productData.map(item => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: item.name,
                },
               unit_amount: Math.round(item.price  * 100), // cộng 2% phí xử lý
            },
            quantity: item.quantity,
        }));

        // Thêm discount vào metadata
        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode: "payment",
            success_url: `${origin}/loader?next=my-orders`,
            cancel_url: `${origin}/cart`,
            metadata: {
                orderId: order._id.toString(),
                userId,
                couponCode: couponCode || '',
                discount: discount || 0
            },
        });

        return res.json({ success: true, url: session.url });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const stripeWebhooks = async (request, response) => {
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const sig = request.headers["stripe-signature"];
    let event; 
    try {
        event = stripeInstance.webhooks.constructEvent(
            request.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        return response.status(400).send(`Webhook Error: ${error.message}`);
    }
    
    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object;
            const { orderId, userId, couponCode, discount } = session.metadata;
            
            try {
                // Cập nhật trạng thái thanh toán
                await Order.findByIdAndUpdate(orderId, { isPaid: true });
                
                // Xóa giỏ hàng của user
                await User.findByIdAndUpdate(userId, { cartItems: {} });
                
                // Cập nhật số lần sử dụng coupon nếu có
                if (couponCode && couponCode !== '') {
                    await Coupon.findOneAndUpdate(
                        { code: couponCode.toUpperCase() },
                        { $inc: { usedCount: 1 } }
                    );
                }
                
                console.log(`Payment successful for order ${orderId}`);
            } catch (error) {
                console.error(`Error processing payment for order ${orderId}:`, error);
            }
            break;
        }
        case "checkout.session.expired": {
            const session = event.data.object;
            const { orderId } = session.metadata;
            
            try {
                // Xóa đơn hàng nếu hết hạn thanh toán
                await Order.findByIdAndDelete(orderId);
                console.log(`Expired order ${orderId} deleted`);
            } catch (error) {
                console.error(`Error deleting expired order ${orderId}:`, error);
            }
            break;
        }
        default:
            console.error(`Unhandled event type ${event.type}`);
            break;
    }
    
    response.json({received: true});
}

export const getUserOrders = async (req, res) => {
    try {
        const  userId  = req.userId;
        const order = await Order.find({ userId }).populate("items.product address").sort({ createdAt: -1 });
        res.json({success:true , order})
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

//api/order/seller

export const getAllOrders = async (req, res) => {
    try {
        // Fetch all orders for seller, not just COD or paid orders
        const order = await Order.find({})
            .populate("items.product address")
            .populate("userId", "name email") // Also populate user info
            .sort({ createdAt: -1 });
        res.json({success:true , order})
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// API để cập nhật trạng thái đơn hàng (cho seller)
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        
        const order = await Order.findByIdAndUpdate(
            orderId, 
            { status }, 
            { new: true }
        ).populate("items.product address userId");
        
        if (!order) {
            return res.json({ success: false, message: "Đơn hàng không tồn tại" });
        }
        
        res.json({ success: true, message: "Cập nhật trạng thái thành công", order });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// API để kiểm tra và đồng bộ trạng thái thanh toán từ Stripe
export const syncPaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        
        const order = await Order.findById(orderId);
        if (!order) {
            return res.json({ success: false, message: "Đơn hàng không tồn tại" });
        }
        
        // Nếu đơn hàng đã được thanh toán hoặc là COD, không cần kiểm tra
        if (order.isPaid || order.paymentType === "COD") {
            return res.json({ 
                success: true, 
                message: "Đơn hàng đã được xử lý", 
                order 
            });
        }
        
        // Kiểm tra với Stripe nếu là thanh toán online
        if (order.paymentType === "Online") {
            const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
            
            // Tìm session theo orderId trong metadata
            const sessions = await stripeInstance.checkout.sessions.list({
                limit: 100
            });
            
            const session = sessions.data.find(s => 
                s.metadata && s.metadata.orderId === orderId
            );
            
            if (session && session.payment_status === 'paid') {
                // Cập nhật trạng thái thanh toán
                await Order.findByIdAndUpdate(orderId, { isPaid: true });
                
                // Cập nhật coupon usage nếu có
                if (order.couponCode) {
                    await Coupon.findOneAndUpdate(
                        { code: order.couponCode.toUpperCase() },
                        { $inc: { usedCount: 1 } }
                    );
                }
                
                return res.json({ 
                    success: true, 
                    message: "Đã đồng bộ trạng thái thanh toán thành công",
                    order: await Order.findById(orderId)
                });
            }
        }
        
        res.json({ 
            success: false, 
            message: "Chưa thanh toán hoặc chưa thể xác minh" 
        });
        
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}
