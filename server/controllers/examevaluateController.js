import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { processPdfWithDocumentAI } from "./pdfhandler.js"; // Import the function
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

export const examevaluateController = async (req, res) => {
  try {
    const { questionFile, studentAnswerFile, correctAnswerFile } = req.files || {};
    const { questionText, studentAnswerText, correctAnswerText } = req.body;

    // Validate inputs (same as before)
    if ((!questionFile && !questionText) || 
        (!studentAnswerFile && !studentAnswerText) || 
        (!correctAnswerFile && !correctAnswerText)) {
      return res.status(400).json({ error: "Missing required inputs" });
    }

    // Process inputs (same as before)
    const question = questionFile ? await processPdfWithDocumentAI(questionFile[0].path) : questionText;
    const studentAnswer = studentAnswerFile ? await processPdfWithDocumentAI(studentAnswerFile[0].path) : studentAnswerText;
    const correctAnswer = correctAnswerFile ? await processPdfWithDocumentAI(correctAnswerFile[0].path) : correctAnswerText;

    // Split and validate (same as before)
    const questions = question.split("\n").filter(q => q.trim() !== "");
    const studentAnswers = studentAnswer.split("\n").filter(a => a.trim() !== "");
    const correctAnswers = correctAnswer.split("\n").filter(a => a.trim() !== "");

    if (questions.length === 0 || studentAnswers.length === 0 || correctAnswers.length === 0) {
      return res.status(400).json({ error: "No valid questions/answers found" });
    }

    if (questions.length !== studentAnswers.length || questions.length !== correctAnswers.length) {
      return res.status(400).json({ error: "Mismatched number of questions, student answers, and correct answers" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp-01-21" });
    
    const evaluations = [];
    let overallScore = 0;

    for (let i = 0; i < questions.length; i++) {
      const prompt = `
      Evaluate the following student answer against the correct answer:
      
      Question: ${questions[i]}
      Student Answer: ${studentAnswers[i]}
      Correct Answer: ${correctAnswers[i]}
      
      Provide:
      1. A score from 0-100
      2. Detailed remarks
      3. Metrics for:
         - Quantitative accuracy
         - Aptitude
         - Reasoning
         - Understanding
         - Remembering
      
      Return your response in valid JSON format ONLY with these fields:
      {
        "score": number,
        "remarks": string,
        "metrics": {
          "quantitative": string,
          "aptitude": string,
          "reasoning": string,
          "understanding": string,
          "remembering": string
        }
      }`;

      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        
        // Clean the response to extract just the JSON
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const evaluation = JSON.parse(text);
        evaluation.questionId = i + 1;
        evaluation.question = questions[i];
        evaluation.studentAnswer = studentAnswers[i];
        evaluation.correctAnswer = correctAnswers[i];
        
        evaluations.push(evaluation);
        overallScore += evaluation.score;
      } catch (err) {
        console.error(`Error evaluating question ${i + 1}:`, err);
        evaluations.push({
          questionId: i + 1,
          question: questions[i],
          studentAnswer: studentAnswers[i],
          correctAnswer: correctAnswers[i],
          score: 0,
          remarks: "Evaluation failed for this question",
          metrics: {
            quantitative: "N/A",
            aptitude: "N/A",
            reasoning: "N/A",
            understanding: "N/A",
            remembering: "N/A"
          }
        });
      }
    }

    overallScore = evaluations.length > 0 ? Math.round(overallScore / evaluations.length) : 0;

    res.json({
      overallScore,
      evaluations
    });

  } catch (error) {
    console.error("Error evaluating answers:", error);
    res.status(500).json({ error: "Failed to evaluate answers" });
  }
};