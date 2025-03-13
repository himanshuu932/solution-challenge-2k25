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
    const prompt = `You are an academic assistant bot specializing in math, science, and academic topics.  
    You must provide **structured, well-formatted responses** that are **clear, concise, and properly separated** into distinct sections.
    
    🔹 **Student Query:** "${query}"
    
    💡 **Response Guidelines:**  
    - **Explanation:** Provide a **brief, clear** explanation in simple terms.  
    - **Formulas (if applicable):** Use **LaTeX syntax**, enclosed in **double dollar signs ($$)** for rendering.  
    - **Code (if applicable):** Always enclose the code within three dashes (**---**) at the start and end.  
    - **Images (if applicable):** If a **graph or image** is useful, provide a **public URL**.  
    - **Links (if applicable):** Provide **clickable links** for additional resources.  
    - ❗ **DO NOT mix explanation, formulas, and code in the same section.** Keep them separate.
    
    ---
    
    ### **Expected Response Format:**  
    **Explanation:**  
    <Brief explanation in simple terms>  
    
    **Formulas (if applicable):**  
    $$ Formula 1 $$  
    $$ Formula 2 $$  
    
    **Images (if applicable):**  
    <Image URL>  
    
    **Links (if applicable):**  
    <Link URL>  
    
    **Code (if applicable):**  
    ---
    <language>  
    # Code starts here  
    print("Hello, World!")  
    ---
    
    🔹 **Strict Formatting Rules:**  
    ✔ Keep sections **clear and separate** (no merging of text, formulas, or code).  
    ✔ **No unnecessary text**—only relevant details.  
    ✔ Ensure code is formatted **cleanly** for readability.  
    
    🚀 Generate a response following these exact instructions.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp-01-21" });
    const responseContent = await model.generateContent(prompt);
    let generatedText = responseContent.response.text();
    console.log("Raw generated response:", generatedText);

    // Remove markdown formatting (e.g., ```json or ```) if present.
    let cleanText = generatedText.trim();

    // Extract LaTeX formulas
    const formulaRegex = /\$\$?(.*?)\$\$?/g;
    const formulas = [];
    let text = cleanText;
    let match;

    while ((match = formulaRegex.exec(cleanText))) {
      formulas.push(match[1].trim());
      text = text.replace(match[0], ""); // Remove the LaTeX block from the text
    }

    // Extract code blocks
    const codeRegex = /---(\w+)?\s*([\s\S]*?)---/g;
    const code = [];
    while ((match = codeRegex.exec(cleanText))) {
      const language = match[1] ? match[1].trim() : "plaintext"; // Detect language or default to plaintext
      code.push({ language, content: match[2].trim() });
      text = text.replace(match[0], ""); // Remove the code block from the text
    }

    // Extract image URLs
    const imageRegex = /https?:\/\/\S+\.(?:png|jpg|jpeg|gif|svg|webp)/g;
    const graphs = cleanText.match(imageRegex) || [];

    // Extract links (non-image URLs)
    const linkRegex = /https?:\/\/\S+/g;
    const links = cleanText.match(linkRegex) || [];
    const filteredLinks = links.filter(link => !graphs.includes(link)); // Exclude image URLs

    // Remove empty sections from the text
    const emptySections = [
      "Formulas:",
      "Images:",
      "Code:",
      "Links:",
    ];
    emptySections.forEach((section) => {
      text = text.replace(new RegExp(`${section}\\s*\\n`, "g"), "");
    });

    // Trim the text to remove any extra whitespace
    text = text.trim();

    res.json({
      text: text, // Clean text without empty sections
      formulas: formulas,
      graphs: graphs,
      links: filteredLinks,
      code: code,
    });
  } catch (error) {
    console.error("Error in selfEvaluationController:", error);
    res.status(500).json({ error: "Failed to process query." });
  }
};