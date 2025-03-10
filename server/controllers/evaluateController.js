// server/controllers/evaluateController.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

export const evaluateController = async (req, res) => {
  try {
    // Expecting req.body.answers to be an array of objects.
    // Each object should include:
    //   questionId, question, correctAnswer, answer, (and optionally file info)
    const { answers } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: "Invalid payload. 'answers' must be an array." });
    }

    const evaluations = [];
    let totalScore = 0;

    for (const item of answers) {
      console.log("Evaluating item:", item);

      // Construct an evaluation prompt with additional parameters.
      const prompt = `Evaluate the following short answer response.
Question: ${item.question}
Correct Answer: ${item.correctAnswer}
Student's Answer: ${item.answer}

Provide:
- An overall score between 0 and 1 (where 1 means fully correct and 0 means completely incorrect),
- A brief explanation (remarks) for the evaluation, and 
- Additional metrics on the following parameters: quantitative ability, aptitude, reasoning, understanding, and remembering.
Each parameter should have a score between 0 and 1.

Format your response as valid JSON with the following keys:
"score": <overall score>,
"remarks": <evaluation explanation>,
"metrics": {
  "quantitative": <score>,
  "aptitude": <score>,
  "reasoning": <score>,
  "understanding": <score>,
  "remembering": <score>
}`;

      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp-01-21" });
      const responseContent = await model.generateContent(prompt);
      const generatedText = responseContent.response.text();
      console.log("Raw generated response:", generatedText);

      // Remove markdown formatting (e.g., ```json ... ```) from the response.
      let jsonString = generatedText.trim();
      jsonString = jsonString.replace(/```(json)?/gi, "").replace(/```/gi, "").trim();
      console.log("Cleaned JSON string:", jsonString);

      let evalResult;
      try {
        evalResult = JSON.parse(jsonString);
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        // Fallback if parsing fails.
        evalResult = { score: 0, remarks: "Could not evaluate the answer.", metrics: {} };
      }

      const score = Number(evalResult.score) || 0;
      totalScore += score;

      evaluations.push({
        questionId: item.questionId,
        score,
        remarks: evalResult.remarks,
        metrics: evalResult.metrics || {}
      });
    }

    // Compute overall score as an average.
    const overallScore = totalScore / answers.length;
    res.json({ overallScore, evaluations, totalScore });
  } catch (error) {
    console.error("Error evaluating short answers:", error);
    res.status(500).json({ error: "Failed to evaluate short answers" });
  }
};
