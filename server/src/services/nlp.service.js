export async function analyzeFeedbackNLP(feedback) {
    return {
        sentiment: null,
        themes: [],
        status: 'pending',
        message: 'NLP analysis is currently paused.'
    };
}