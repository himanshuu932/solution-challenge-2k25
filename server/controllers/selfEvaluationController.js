// server/controllers/selfEvaluationController.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

export const selfEvaluationController = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required." });
    }

    // Construct a prompt for the academic assistance bot.
    const prompt = `You are an academic assistance bot that helps students understand complex topics and resolve their queries.
Student Query: "${query}"
Provide a detailed, clear, and helpful answer that addresses the student's query and offers additional guidance if necessary.
Format your response as plain text.`;


    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp-01-21" });
    const responseContent = await model.generateContent(prompt);
    let generatedText = responseContent.response.text();
    console.log("Raw generated response:", generatedText);

    // Remove markdown formatting (e.g., ```json or ```) if present.
    let cleanText = generatedText.trim();
    cleanText = cleanText.replace(/```(json)?/gi, "").replace(/```/gi, "").trim();

    res.json({ answer: cleanText });
  } catch (error) {
    console.error("Error in selfEvaluationController:", error);
    res.status(500).json({ error: "Failed to process query." });
  }
};
