import Groq from "groq-sdk";

export const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
export const GROQ_MODEL = "llama-3.3-70b-versatile"; // good balance of quality/speed on free tier