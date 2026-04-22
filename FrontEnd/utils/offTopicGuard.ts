/**
 * Client-side guard for checking if a message is off-topic.
 * Returns true if the message is unrelated to real estate.
 */
export const isOffTopic = (message: string): boolean => {
  const msg = message.toLowerCase();

  const offTopicKeywords = [
    // General Knowledge
    "capital of", "who invented", "history of", "explain", "meaning of",
    // Food
    "recipe", "biryani", "khana", "restaurant", "cook", "pizza",
    // Sports
    "cricket", "football", "match", "team", "player", "score", "world cup",
    // Tech/Coding
    "python", "javascript", "code", "bug", "website", "program", "api",
    // Entertainment
    "movie", "drama", "song", "actor", "netflix", "youtube", "film",
    // Weather
    "temperature", "rain", "mausam", "forecast", "weather",
    // Math/Science
    "calculate", "solve", "formula", "equation", "math", "physics",
    // Relationships
    "love", "girlfriend", "marriage", "relationship advice", "dating",
    // Politics
    "government", "election", "minister", "party", "politician", "pmo",
  ];

  return offTopicKeywords.some(keyword => msg.includes(keyword));
};

export const REFUSAL_MESSAGE = "Mujhe maafi chahiye! Main sirf HomeEase app par property se related sawaalon mein madad kar sakta hoon. Kripya mujhse flats, ghar, kiraya, ya property khareedne ke baare mein poochein!";
export const REFUSAL_MESSAGE_EN = "I'm sorry! I can only help with property-related questions on the HomeEase app. Please ask me about flats, houses, rent, or buying properties in Pakistan!";
