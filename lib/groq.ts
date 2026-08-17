import Groq from "groq-sdk";

export const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
export const GROQ_MODEL = "openai/gpt-oss-120b"; // good balance of quality/speed on free tier
