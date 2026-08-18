import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const analyzeFeedbackNLP = async (feedbackText) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key missing. Defaulting to neutral sentiment.');
      return { sentiment: 'neutral', themes: ['general'] };
    }

    // Call 1: Sentiment Analysis
    const sentimentResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: `Classify the sentiment of this veterinary service feedback as exactly one word: positive, neutral, or negative. Feedback in English, Tagalog, or Bisaya: "${feedbackText}"`
      }],
      temperature: 0.1
    });

    const sentiment = sentimentResponse.choices[0].message.content.trim().toLowerCase();

    // Call 2: Theme Extraction
    const themeResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: `Extract up to 3 short thematic keywords from this feedback (e.g., "technician punctuality", "service quality"). Return ONLY a JSON array of strings: "${feedbackText}"`
      }],
      temperature: 0.2
    });

    let themes = [];
    try {
      themes = JSON.parse(themeResponse.choices[0].message.content.trim());
    } catch {
      themes = ['general service'];
    }

    return { sentiment, themes };
  } catch (err) {
    console.error('NLP Analysis failed:', err.message);
    return { sentiment: 'neutral', themes: ['service review'] };
  }
};