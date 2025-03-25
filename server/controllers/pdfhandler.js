import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load credentials from environment variables
const credentialsJson = process.env.JSON;
const credentials = JSON.parse(credentialsJson);

// MongoDB Schema for storing extracted text
const textDataSchema = new mongoose.Schema({
  text: { type: String, required: true },
  filename: { type: String, required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  createdAt: { type: Date, default: Date.now },
});

const TextData = mongoose.model('TextData', textDataSchema);

/**
 * Splits a PDF into smaller chunks.
 * @param {string} pdfPath - Path to the PDF file.
 * @param {number} maxPages - Maximum number of pages per chunk (default is 5).
 * @returns {Promise<string[]>} - Resolves with an array of chunk file paths.
 */
const splitPdf = async (pdfPath, maxPages = 5) => {
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const totalPages = pdfDoc.getPageCount();
  const chunks = [];

  for (let i = 0; i < totalPages; i += maxPages) {
    const chunkDoc = await PDFDocument.create();
    const endPage = Math.min(i + maxPages, totalPages);

    for (let j = i; j < endPage; j++) {
      const [copiedPage] = await chunkDoc.copyPages(pdfDoc, [j]);
      chunkDoc.addPage(copiedPage);
    }

    const chunkBytes = await chunkDoc.save();
    const chunkPath = path.join(__dirname, `chunk_${Math.floor(i / maxPages) + 1}.pdf`);
    fs.writeFileSync(chunkPath, chunkBytes);
    chunks.push(chunkPath);
  }

  return chunks;
};

/**
 * Processes a PDF file with Google Document AI.
 * @param {string} pdfPath - Path to the PDF file.
 * @returns {Promise<string>} - Resolves with the extracted text.
 */
export const processPdfWithDocumentAI = async (pdfPath) => {
  const projectId = "inspiring-dryad-448710-v9"; // Replace with your project ID
  const location = "us"; // Replace with the location of your processor
  const processorId = "d9da5bdc2f8e5f4d"; // Replace with your processor ID

  const fileName = path.isAbsolute(pdfPath) ? pdfPath : path.join(__dirname, pdfPath);
  const fileContent = fs.readFileSync(fileName);
  const fileExtension = path.extname(pdfPath).toLowerCase();
  const supportedFormats = [".jpeg", ".jpg", ".png", ".bmp", ".pdf", ".tiff", ".tif", ".gif"];

  if (!supportedFormats.includes(fileExtension)) {
    console.error(`Unsupported file format: ${fileExtension}`);
    return "";
  }

  // Map file extensions to MIME types
  const mimeTypeMap = {
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".png": "image/png",
    ".bmp": "image/bmp",
    ".pdf": "application/pdf",
    ".tiff": "image/tiff",
    ".tif": "image/tiff",
    ".gif": "image/gif",
  };
  const mimeType = mimeTypeMap[fileExtension];

  // Initialize the Document AI client with credentials
  const client = new DocumentProcessorServiceClient({
    credentials: credentials,
  });

  const request = {
    name: `projects/${projectId}/locations/${location}/processors/${processorId}`,
    rawDocument: {
      content: fileContent.toString("base64"),
      mimeType: mimeType,
    },
  };

  try {
    const [result] = await client.processDocument(request);
    const { document } = result;
    if (document && document.text) {
      console.log("Extracted text from PDF:");
      console.log(document.text);
      return document.text;
    } else {
      console.log("No text was extracted from the document.");
      return "";
    }
  } catch (error) {
    console.error("Error during Document AI processing:", error);
    throw error;
  }
};

/**
 * Handles PDF upload, splitting, text extraction, and saving to MongoDB.
 * @param {Object} file - The uploaded file object.
 * @param {string} studentId - The ID of the student uploading the file.
 * @returns {Promise<Object>} - Resolves with the extracted text and status.
 */
export const handlePdfUpload = async (file, studentId) => {
  try {
    const filePath = file.path; // Path to the uploaded file
    const fileExtension = path.extname(filePath).toLowerCase();

    // Check if the file is a PDF
    if (fileExtension !== '.pdf') {
      fs.unlinkSync(filePath); // Delete the file if it's not a PDF
      throw new Error("Only PDF files are supported.");
    }

    // Split the PDF into smaller chunks (e.g., 5 pages per chunk)
    const chunkPaths = await splitPdf(filePath, 5);

    // Process each chunk with Document AI
    let extractedText = "";
    for (const chunkPath of chunkPaths) {
      const chunkText = await processPdfWithDocumentAI(chunkPath);
      extractedText += chunkText + "\n"; // Append the extracted text from each chunk

      // Delete the chunk file after processing
      fs.unlinkSync(chunkPath);
    }

    // Delete the original uploaded file after processing
    fs.unlinkSync(filePath);

    // Save the extracted text to MongoDB
    const newTextData = new TextData({
      text: extractedText,
      filename: file.originalname,
      studentId: studentId,
    });
    await newTextData.save();

    return { success: true, message: "File processed successfully.", text: extractedText };
  } catch (error) {
    console.error("Error in handlePdfUpload:", error);
    throw new Error("Failed to process file.");
  }
};