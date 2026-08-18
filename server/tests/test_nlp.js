import assert from 'assert';
import { analyzeFeedbackNLP } from '../src/services/nlp.service.js';

(async () => {
  // Force missing API key to exercise the fallback path
  process.env.OPENAI_API_KEY = '';

  const feedback = 'The technician was kind and arrived on time.';
  const result = await analyzeFeedbackNLP(feedback);
  console.log('NLP fallback result:', result);

  try {
    assert.strictEqual(result.sentiment, 'neutral', 'Expected fallback sentiment neutral');
    assert.ok(Array.isArray(result.themes), 'themes should be an array');
    console.log('NLP fallback test passed');
    process.exit(0);
  } catch (err) {
    console.error('NLP fallback test failed:', err.message);
    process.exit(2);
  }
})();
