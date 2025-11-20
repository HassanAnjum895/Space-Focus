import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getInspirationalQuote = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate a short, wise, calm, and space-themed inspirational quote for a student or worker focusing on a task. Maximum 25 words. Do not include the author name or quotation marks.",
      config: {
        temperature: 0.7,
      }
    });
    
    return response.text?.trim() ?? "The universe favors the focused mind.";
  } catch (error) {
    console.error("Failed to fetch quote:", error);
    return "Stars do not rush, yet they shine.";
  }
};