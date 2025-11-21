import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function testModel(modelName) {
    console.log(`Testing ${modelName}...`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        console.log(`Success with ${modelName}! Response:`, result.response.text());
    } catch (error) {
        console.error(`Error with ${modelName}:`, error);
    }
}

async function listModels() {
    await testModel("gemini-2.0-flash");
    await testModel("gemini-1.5-flash");
    await testModel("gemini-1.5-flash-001");
    await testModel("gemini-pro");
}

listModels();
