import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("API Key not found!");
        return;
    }

    console.log("Using API Key:", apiKey.substring(0, 5) + "...");

    const genAI = new GoogleGenerativeAI(apiKey);
    // Trying the model I just updated to
    const modelName = "gemini-flash-latest";
    console.log(`Testing model: ${modelName}`);

    try {
        const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: "You are a helpful assistant."
        });

        const chat = model.startChat({
            history: [],
        });

        console.log("Sending message...");
        const result = await chat.sendMessage("Hello, are you working?");
        const response = await result.response;
        const text = response.text();
        console.log("Response:", text);
    } catch (error) {
        console.error("Error communicating with Gemini:", error);
        if (error.response) {
            console.error("Error details:", JSON.stringify(error.response, null, 2));
        }
    }
}

testGemini();
