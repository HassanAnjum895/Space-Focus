
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getInspirationalQuote = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Generate a short, wise, calm, and space-themed inspirational quote for a student or worker focusing on a task. Maximum 20 words. No author name.",
    });
    return response.text?.trim() ?? "The universe favors the focused mind.";
  } catch (error) {
    return "Stars do not rush, yet they shine.";
  }
};

export const breakdownTask = async (taskText: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Break down this task into exactly 3 very short, actionable sub-steps: "${taskText}". Return as a simple list.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });
    const data = JSON.parse(response.text || '{"steps": []}');
    return data.steps || [];
  } catch (error) {
    console.error("Task breakdown failed", error);
    return ["Step 1: Start small", "Step 2: Stay focused", "Step 3: Finish strong"];
  }
};

export const generateSessionSummary = async (minutes: number, completedTasks: string[]): Promise<string> => {
  try {
    const taskList = completedTasks.length > 0 
      ? `During this orbit, we successfully executed: ${completedTasks.join(", ")}.` 
      : "No new missions were finalized during this cycle, but the course remains steady.";
      
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a short "Captain's Log" entry (max 35 words). Background: The crew completed a ${minutes}-minute burn. ${taskList} Use immersive space metaphors (engines, orbits, deep void, signals).`,
    });
    return response.text?.trim() ?? "Mission successful. The orbit remains stable.";
  } catch (error) {
    return "Orbit stabilized. Excellent work, Captain.";
  }
};
