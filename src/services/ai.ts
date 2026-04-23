/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateBannerBackground(prompt: string): Promise<string | null> {
  try {
    // Pollinations.ai is a great free alternative for image generation
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&nologo=true&enhance=true&seed=${Math.floor(Math.random() * 1000000)}`;
    
    // We fetch the image and convert it to base64 to maintain compatibility with your existing state
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Image generation failed:", error);
    return null;
  }
}
