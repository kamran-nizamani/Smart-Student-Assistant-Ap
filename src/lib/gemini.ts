import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const getStudyHelp = async (query: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: query,
      config: {
        systemInstruction: "You are a helpful study assistant for students. This application is developed by Kamran Nizamani. Provide clear, concise, and accurate information to help them with their studies. Use markdown for formatting.",
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sorry, I couldn't help with that right now.";
  }
};

export const generateQuiz = async (subject: string, difficulty: string = 'medium') => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is missing or empty!");
      throw new Error("API Key is missing");
    }
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an expert academic examiner. Create a comprehensive 5-question multiple choice quiz about "${subject}" at a ${difficulty} difficulty level.
      Each question must be thought-provoking and test conceptual understanding.
      Provide exactly 4 distinct options per question.
      Include a detailed explanation that clarifies why the correct answer is right and why others are potentially misleading.`,
      config: {
        systemInstruction: "You generate high-quality academic assessments. Your output must be a valid JSON array of objects.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING, description: "The quiz question text" },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Exactly 4 multiple choice options"
              },
              correctAnswer: { type: Type.STRING, description: "The exact string of the correct option" },
              explanation: { type: Type.STRING, description: "Educational explanation of the answer" }
            },
            required: ["question", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Quiz Generation Error:", error);
    throw error;
  }
};

export const summarizeNote = async (title: string, content: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Please provide a concise, structured summary of the following study note.
      Title: ${title}
      Content: ${content}
      
      Structure the summary with key points and a 'TL;DR' at the end. Use markdown.`,
      config: {
        systemInstruction: "You are an expert academic summarizer. Focus on key concepts and actionable insights.",
      },
    });
    return response.text;
  } catch (error) {
    console.error("Summarization Error:", error);
    return "Could not generate summary.";
  }
};

export const generateQuizFromNote = async (title: string, content: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a 5-question multiple choice quiz based strictly on the following study note.
      Title: ${title}
      Content: ${content}
      
      Ensure questions test understanding of the material.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ["question", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Quiz from Note Error:", error);
    throw error;
  }
};
