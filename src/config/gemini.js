import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export default new GoogleGenAI({ apiKey: GEMINI_API_KEY });
