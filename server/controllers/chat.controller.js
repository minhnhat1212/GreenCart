import { GoogleGenerativeAI } from "@google/generative-ai";

const chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: "API Key not configured" });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: "Bạn là trợ lý ảo của GreenCart, một cửa hàng bán rau củ quả sạch. Hãy trả lời ngắn gọn, thân thiện và hữu ích." }],
                },
                {
                    role: "model",
                    parts: [{ text: "Chào bạn! Tôi là trợ lý ảo của GreenCart. Tôi có thể giúp gì cho bạn hôm nay?" }],
                },
            ],
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });
    } catch (error) {
        console.error("Error communicating with Gemini:", error);
        res.status(500).json({ error: "Failed to get response from AI" });
    }
};

export { chatWithAI };
