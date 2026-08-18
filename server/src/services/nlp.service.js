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

    // Single structured call to reduce cost: return a strict JSON object
    const prompt = `Analyze the following veterinary service feedback. Return ONLY a JSON object with two keys: "sentiment" and "themes".
"sentiment" must be exactly one of: positive, neutral, negative.
"themes" must be a JSON array with up to 3 short keyword phrases (strings). Do NOT output any additional text, explanation, or markdown.
Feedback: ${JSON.stringify(feedbackText)}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a concise JSON-only extractor.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.0,
      max_tokens: 150
    });

    const raw = response.choices?.[0]?.message?.content?.trim() || '';
    let parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      // Try to recover by extracting the first JSON block
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try { parsed = JSON.parse(jsonMatch[0]); } catch {};
      }
    }

    if (!parsed || !parsed.sentiment) {
      return { sentiment: 'neutral', themes: ['general'] };
    }

    const sentiment = String(parsed.sentiment).toLowerCase();
    const themes = Array.isArray(parsed.themes) ? parsed.themes.slice(0, 3) : ['general'];

    return { sentiment, themes };
  } catch (err) {
    console.error('NLP Analysis failed:', err?.message || err);
    return { sentiment: 'neutral', themes: ['service review'] };
  }
};