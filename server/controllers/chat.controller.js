import { GoogleGenerativeAI } from "@google/generative-ai";

import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import Order from "../models/Order.js";
import jwt from "jsonwebtoken";

const getContext = async (userId) => {
    let context = "";

    // 1. Lấy thông tin sản phẩm
    const products = await Product.find({ isDeleted: false, inStock: true }).select("name price unit description category");
    context += "DANH SÁCH SẢN PHẨM HIỆN CÓ:\n";
    products.forEach(p => {
        context += `- ${p.name}: ${p.price} VND / ${p.unit}. Mô tả: ${p.description.join(", ")}. Danh mục: ${p.category}\n`;
    });

    // 2. Lấy thông tin mã giảm giá
    const coupons = await Coupon.find({ isActive: true, expiryDate: { $gt: new Date() } });
    context += "\nMÃ GIẢM GIÁ ĐANG HOẠT ĐỘNG:\n";
    if (coupons.length > 0) {
        coupons.forEach(c => {
            context += `- Mã: ${c.code}, Giảm: ${c.discount}%, Tối đa: ${c.maxDiscount} VND, Đơn tối thiểu: ${c.minAmount} VND, Hết hạn: ${new Date(c.expiryDate).toLocaleDateString()}\n`;
        });
    } else {
        context += "Hiện không có mã giảm giá nào.\n";
    }

    // 3. Lấy thông tin đơn hàng của user (nếu đã đăng nhập)
    if (userId) {
        const orders = await Order.find({ userId }).sort({ createdAt: -1 }).limit(5).populate("items.product", "name");
        context += "\nĐƠN HÀNG CỦA BẠN:\n";
        if (orders.length > 0) {
            orders.forEach(o => {
                const items = o.items.map(i => `${i.product?.name || "Sản phẩm đã xóa"} x${i.quantity}`).join(", ");
                context += `- Mã đơn: ${o._id}, Trạng thái: ${o.status}, Tổng tiền: ${o.amount} VND, Ngày đặt: ${new Date(o.createdAt).toLocaleDateString()}. Gồm: ${items}\n`;
            });
        } else {
            context += "Bạn chưa có đơn hàng nào gần đây.\n";
        }
    } else {
        context += "\nKHÁCH HÀNG CHƯA ĐĂNG NHẬP (Không thể xem thông tin đơn hàng cá nhân).\n";
    }

    return context;
};

const chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: "API Key not configured" });
        }

        // Xác thực user từ cookie (nếu có) để lấy context đơn hàng
        let userId = null;
        const token = req.cookies?.token;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id;
            } catch (err) {
                console.log("Token invalid or expired");
            }
        }

        const contextData = await getContext(userId);

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: `Bạn là trợ lý ảo của GreenCart, một cửa hàng bán rau củ quả sạch.
            Nhiệm vụ của bạn là hỗ trợ khách hàng tìm kiếm sản phẩm, cung cấp thông tin mã giảm giá và kiểm tra tình trạng đơn hàng.
            
            Dưới đây là dữ liệu thời gian thực từ hệ thống (Sản phẩm, Mã giảm giá, Đơn hàng của khách):
            --------------------------------------------------
            ${contextData}
            --------------------------------------------------
            
            HƯỚNG DẪN TRẢ LỜI:
            1. Chỉ trả lời dựa trên thông tin được cung cấp ở trên. Nếu khách hỏi về sản phẩm không có trong danh sách, hãy nói là cửa hàng hiện chưa có.
            2. Nếu khách hỏi về đơn hàng mà chưa đăng nhập, hãy nhắc họ đăng nhập để kiểm tra.
            3. Trả lời ngắn gọn, thân thiện, xưng hô là "mình" hoặc "GreenCart".
            4. Giá tiền luôn hiển thị kèm đơn vị VND.
            `
        });

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: "Xin chào" }],
                },
                {
                    role: "model",
                    parts: [{ text: "Chào bạn! Mình là trợ lý ảo của GreenCart. Mình có thể giúp gì cho bạn về sản phẩm, ưu đãi hay đơn hàng hôm nay?" }],
                },
            ],
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });
    } catch (error) {
        console.error("Error communicating with Gemini:", error);
        if (error.response) {
            console.error("Error details:", JSON.stringify(error.response, null, 2));
        }
        res.status(500).json({
            error: "Failed to get response from AI",
            details: error.message,
            apiError: error.response ? error.response : "No response details"
        });
    }
};

export { chatWithAI };
