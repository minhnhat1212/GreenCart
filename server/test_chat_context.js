import axios from 'axios';

const API_URL = 'http://localhost:4000/api/chat';

async function testChat() {
    try {
        console.log("Testing Chat API (Guest Mode)...");
        const response = await axios.post(API_URL, {
            message: "Giá cà chua bao nhiêu? Có mã giảm giá nào không?"
        });
        console.log("Response:", response.data.reply);
    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    }
}

testChat();
