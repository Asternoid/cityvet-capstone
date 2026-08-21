const POSITIVE_KEYWORDS = [
  'kind', 'friendly', 'helpful', 'polite', 'professional', 'patient',
  'great', 'excellent', 'good', 'smooth', 'quick', 'timely', 'on time',
  'satisfied', 'happy', 'thankful', 'comfortable', 'clean'
];

const NEGATIVE_KEYWORDS = [
  'late', 'rude', 'slow', 'bad', 'poor', 'unprofessional', 'confusing',
  'expensive', 'overpriced', 'frustrated', 'angry', 'dirty', 'delayed',
  'waited', 'issue', 'problem', 'missed', 'worst'
];

const THEME_KEYWORDS = {
  punctuality: ['on time', 'timely', 'late', 'delay', 'waited', 'waiting', 'schedule'],
  staff_behavior: ['kind', 'friendly', 'rude', 'polite', 'professional', 'helpful', 'staff', 'technician'],
  communication: ['explained', 'explaining', 'informed', 'updated', 'message', 'call', 'communication'],
  pricing: ['price', 'cost', 'expensive', 'overpriced', 'charged', 'bill'],
  cleanliness: ['clean', 'dirty', 'hygiene', 'sanitary'],
  treatment_quality: ['treatment', 'care', 'procedure', 'service', 'checkup', 'visit', 'follow up']
};

const normalizeText = (text = '') =>
  String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const detectThemes = (text) => {
  const normalized = normalizeText(text);
  const hits = Object.entries(THEME_KEYWORDS)
    .filter(([, keywords]) => keywords.some((keyword) => normalized.includes(keyword)))
    .map(([theme]) => theme);

  return hits.length ? hits.slice(0, 3) : ['general_service'];
};

const detectSentiment = (text) => {
  const normalized = normalizeText(text);

  if (!normalized) return 'neutral';

  let positiveScore = 0;
  let negativeScore = 0;

  POSITIVE_KEYWORDS.forEach((keyword) => {
    if (normalized.includes(keyword)) positiveScore += 1;
  });

  NEGATIVE_KEYWORDS.forEach((keyword) => {
    if (normalized.includes(keyword)) negativeScore += 1;
  });

  if (positiveScore - negativeScore >= 3) return 'positive';
  if (negativeScore - positiveScore >= 3) return 'negative';

  return 'neutral';
};

export async function analyzeFeedbackNLP(feedback) {
  const text = typeof feedback === 'string' ? feedback : '';
  const normalizedText = normalizeText(text);

  if (!normalizedText) {
    return {
      sentiment: 'neutral',
      themes: ['general_service'],
      status: 'fallback',
      message: 'No feedback text provided; used local fallback analysis.'
    };
  }

  return {
    sentiment: detectSentiment(normalizedText),
    themes: detectThemes(normalizedText),
    status: 'fallback',
    message: 'No paid API key configured; used the local no-cost fallback analyzer.'
  };
}