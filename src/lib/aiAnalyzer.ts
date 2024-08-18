import axios from 'axios';

const OPENROUTER_API_KEY = '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';
const YOUR_SITE_URL = 'http://localhost:3000'; // Update this when you deploy
const YOUR_SITE_NAME = 'Scraper Sensei';

export async function analyzeContent(content: { title: string; text: string }) {
  try {
    const prompt = `Analyze the following content and provide a JSON response with the following structure, and only this structure without any additional text:
{
  "titleSentiment": "Positive/Negative/Neutral",
  "textSentiment": "Positive/Negative/Neutral",
  "category": "Technology/Science/Politics/Entertainment/Sports/Other",
  "analysis": "A brief analysis of the content"
}

Content to analyze:
Title: ${content.title}
Text: ${content.text}`;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [
          { role: 'user', content: prompt },
        ],
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': YOUR_SITE_URL,
          'X-Title': YOUR_SITE_NAME,
          'Content-Type': 'application/json',
        },
      }
    );

    const responseContent = response.data.choices[0].message.content.trim();
    const jsonStartIndex = responseContent.indexOf('{');
    const jsonEndIndex = responseContent.lastIndexOf('}') + 1;
    const jsonString = responseContent.slice(jsonStartIndex, jsonEndIndex);

    const result = JSON.parse(jsonString);
    return result;
  } catch (error) {
    console.error('Error analyzing content:', error);
    throw error;
  }
}