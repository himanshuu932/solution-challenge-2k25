import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();
console.log("Using API Key:", process.env.API_KEY);

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

export const generateQuestion = async (req, res) => {
  try {
    const { topic, type, level, Numebr } = req.body;
    if (!topic || !type || !level) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp-01-21" });
    
    // System instructions: instruct the model to return structured JSON.
    const systemInstructions = `You are an educational content generator specialized in creating questions. 
Your responses must be a valid JSON object with the following structure based on the question type:

1. For Multiple-Choice Questions:
{
  "question": "What is the capital of France?",
  "options": [
    {"label": "a", "text": "Paris"},
    {"label": "b", "text": "London"},
    {"label": "c", "text": "Berlin"},
    {"label": "d", "text": "Madrid"}
  ],
  "correctAnswer": "a",
  "explanation": {
    "correct": "Paris is the capital of France.",
    "a": "Paris is the correct answer because it is the capital of France.",
    "b": "London is the capital of the United Kingdom, not France.",
    "c": "Berlin is the capital of Germany, not France.",
    "d": "Madrid is the capital of Spain, not France."
  },
  "metadata": {
    "topic": "Geography",
    "difficulty": "easy",
    "questionType": "multiple-choice"
  }
}

2. For Short Answer Questions:
{
  "question": "What is the chemical formula for water?",
  "correctAnswer": "H2O",
  "explanation": {
    "correct": "Water is composed of two hydrogen atoms and one oxygen atom."
  },
  "metadata": {
    "topic": "Chemistry",
    "difficulty": "easy",
    "questionType": "short-answer"
  }
}

3. For Long Answer Questions:
{
  "question": "Explain the process of photosynthesis.",
  "correctAnswer": "Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods with the help of chlorophyll. It involves the conversion of carbon dioxide and water into glucose and oxygen.",
  "explanation": {
    "correct": "Photosynthesis is a vital process for life on Earth as it converts light energy into chemical energy, producing oxygen as a byproduct."
  },
  "metadata": {
    "topic": "Biology",
    "difficulty": "medium",
    "questionType": "long-answer"
  }
}

Do not include any additional commentary or markdown formatting outside the JSON object.`; // Use the updated system instructions here.

    // User instruction: specify the question parameters.
    const userInstruction = `Generate ${Numebr} of questions of ${type} for ${level} level students on the topic: ${topic}.`;

    // Combine system and user instructions.
    const fullPrompt = `${systemInstructions}\n${userInstruction}`;

    // Generate content.
    const responseContent = await model.generateContent(fullPrompt);
    const generatedText = responseContent.response.text();
    console.log("Raw generated response:", generatedText);

    // Remove markdown code block formatting if present.
    let jsonString = generatedText.trim();
    if (jsonString.startsWith("```json")) {
      jsonString = jsonString.substring(7).trim(); // remove ```json
    }
    if (jsonString.endsWith("```")) {
      jsonString = jsonString.substring(0, jsonString.length - 3).trim(); // remove trailing ```
    }

    // Attempt to parse the cleaned output as JSON.
    let generatedOutput;
    try {
      generatedOutput = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse JSON, returning raw text.", parseError);
      generatedOutput = { question: generatedText };
    }
    
    console.log("Parsed output:", generatedOutput);
    res.json(generatedOutput);
  } catch (error) {
    console.error("Error generating question:", error);
    res.status(500).json({ error: "Failed to generate question" });
  }
};
