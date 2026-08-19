/**
 * NLP Service
 *
 * NLP integration is temporarily disabled.
 * The NLP model will be integrated after the project
 * selects the final free NLP provider.
 */

export async function analyzeFeedback(text) {
  return {
    status: 'pending',
    sentiment: null,
    themes: [],
    recurringIssues: [],
    confidence: null,
  };
}