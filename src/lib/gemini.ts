import { GoogleGenAI, Type } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getStudyHelp = async (query: string) => {
  if (!apiKey) {
    return "API Key is missing. Please configure VITE_GEMINI_API_KEY.";
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: query,
      config: {
        systemInstruction: "You are a helpful study assistant for students. Provide clear, concise, and accurate information to help them with their studies. Use markdown for formatting.",
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sorry, I couldn't help with that right now.";
  }
};

export const generateQuiz = async (subject: string, difficulty: string = 'medium') => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please configure VITE_GEMINI_API_KEY.");
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `Generate a 5-question multiple choice quiz about ${subject} with ${difficulty} difficulty level.`,
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
    console.error("Quiz Generation Error:", error);
    throw error;
  }
};
