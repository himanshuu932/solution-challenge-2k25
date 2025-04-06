import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const calculateAverageMetrics = (evaluations) => {
  const metricsSum = { clarity: 0, depth: 0, accuracy: 0, originality: 0, practicality: 0 };
  evaluations.forEach(evalResult => {
    metricsSum.clarity += evalResult.metrics.clarity || 0;
    metricsSum.depth += evalResult.metrics.depth || 0;
    metricsSum.accuracy += evalResult.metrics.accuracy || 0;
    metricsSum.originality += evalResult.metrics.originality || 0;
    metricsSum.practicality += evalResult.metrics.practicality || 0;
  });
  const count = evaluations.length || 1;
  return {
    clarity: parseFloat((metricsSum.clarity / count).toFixed(2)),
    depth: parseFloat((metricsSum.depth / count).toFixed(2)),
    accuracy: parseFloat((metricsSum.accuracy / count).toFixed(2)),
    originality: parseFloat((metricsSum.originality / count).toFixed(2)),
    practicality: parseFloat((metricsSum.practicality / count).toFixed(2))
  };
};

export const evaluateFilesController = async (req, res) => {
  try {
    const { questionsText, answersText } = req.body;
    if (!questionsText || !answersText) {
      return res.status(400).json({ success: false, error: "Both questions and answers text are required." });
    }

    const prompt = `
      You are an advanced evaluation system. The input consists of two texts:
      1. The 'Questions Text' which contains several questions, possibly numbered.
      2. The 'Answers Text' which contains corresponding answers.

      Your task is to:
      - Identify each question and its corresponding answer, even if they are multiline or written as paragraphs.
      - Pair them correctly based on numbering, context, and structure.
      - Provide a detailed evaluation for each pair based on relevance, clarity, accuracy, depth, originality, and practicality.
      - Provide a score between 0-100 for each answer.
      - Provide feedback on how the answer can be improved.
      - Generate a JSON response where each entry includes: {question, answer, score, feedback, metrics}.
      
      Questions Text: ${questionsText}
      Answers Text: ${answersText}

      Format: [{ "question": "Question Text", "answer": "Answer Text", "score": number, "feedback": "Feedback Text", "metrics": { "clarity": number, "depth": number, "accuracy": number, "originality": number, "practicality": number } }]
    `;

    const evaluations = [];
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp-01-21" });
      const result = await model.generateContent(prompt);
      const text = (await result.response).text();
      const cleanedText = text.replace(/```json|```/g, "").trim();  // Remove code block markers
      const evalResults = JSON.parse(cleanedText);
      

      let totalScore = 0;
      const scaleMetric = (value) => {
        const num = parseFloat(value) || 0;
        
        if (num <= 1) return parseFloat((num * 100).toFixed(2)); // 0.9 → 90%
        if (num <= 10) return parseFloat((num * 10).toFixed(2));  // 9 → 90%
        if (num <= 100) return parseFloat(num.toFixed(2));        // 90 → 90%
        return parseFloat((num / 100).toFixed(2));                // 900 → 9%
      };

      
      evalResults.forEach((evalResult, index) => {
        const rawScore = Number(evalResult.score) || 0;
        const score = Math.min(Math.max(rawScore > 1 ? rawScore / 100 : rawScore, 0), 1);
        
        totalScore += score;
      
        evaluations.push({
          questionNumber: index + 1,
          question: evalResult.question,
          answer: evalResult.answer,
          score: parseFloat((score ).toFixed(2)), // Convert to percentage
          feedback: evalResult.feedback || "No feedback provided",
          metrics: {
            clarity: scaleMetric(evalResult.metrics?.clarity || 0),
            depth: scaleMetric(evalResult.metrics?.depth || 0),
            accuracy: scaleMetric(evalResult.metrics?.accuracy || 0),
            originality: scaleMetric(evalResult.metrics?.originality || 0),
            practicality: scaleMetric(evalResult.metrics?.practicality || 0)
          }
        });
      });
      

      const overallScore = evaluations.length > 0 ? totalScore / evaluations.length : 0;

      res.json({
        success: true,
        overallScore: parseFloat(overallScore.toFixed(2)),
        evaluations,
        summary: {
          totalQuestions: evalResults.length,
          evaluated: evaluations.length,
          averageMetrics: calculateAverageMetrics(evaluations)
        }
      });
    } catch (error) {
      console.error("Evaluation Error:", error);
      res.status(500).json({ success: false, error: "Evaluation failed", details: error.message });
    }

  } catch (error) {
    console.error("Error in evaluateFilesController:", error);
    res.status(500).json({ success: false, error: "Evaluation failed", details: error.message });
  }
};
