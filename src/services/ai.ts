/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */



export async function generateBannerBackground(prompt: string): Promise<string | null> {
  try {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error ${response.status}`);
    }

    const data = await response.json();
    return data.image;
  } catch (error: any) {
    console.error("Image generation failed:", error);
    alert(error.message || "Failed to generate image. Please check that GEMINI_API_KEY is configured in your .env.local file.");
    return null;
  }
}
