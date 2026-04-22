/**
 * Detects the language of a message (English, Urdu script, or Hinglish).
 * 
 * @param message User's input message
 * @returns detected language code
 */
export const detectLanguage = (message: string): 'english' | 'urdu' | 'hinglish' => {
  const urduChars = /[\u0600-\u06FF]/;
  const urduLatinWords = [
    'kya','hai','hain','mein','ka','ki','ke','nahi','chahiye',
    'ghar','flat','kiraya','aap','main','hoon','please','bhi',
    'aur','ya','agar','toh','karo','dena','lena','wala','wali',
    'yahan','wahan','abhi','bahut','accha','theek','shukriya',
    'meherbani','zaroor','bilkul','haan','matlab',
    'batao','dikhao','dhundho','mil','sakta','chahta'
  ];

  const lower = message.toLowerCase().trim();
  const words = lower.split(/\s+/);

  // 1. Pure Urdu script detection
  if (urduChars.test(message)) return 'urdu';

  // 2. Romanized Urdu/Hindi (Hinglish) detection
  const urduScore = words.filter(w => urduLatinWords.includes(w)).length;
  const totalWords = words.length;

  // Heuristic: If 2+ words are Urdu-Latin, or 1/4 words in short sentences.
  if (urduScore >= 2 || (totalWords <= 4 && urduScore >= 1)) return 'hinglish';

  // 3. Default to English
  return 'english';
};

/**
 * Language-aware refusal messages for off-topic queries.
 */
export const REFUSAL_MESSAGES = {
  english: "I'm sorry! I can only help with property-related questions on the HomeEase app. Please ask me about flats, houses, rent, or buying properties in Pakistan!",
  urdu: "معذرت! میں صرف HomeEase ایپ پر پراپرٹی سے متعلق سوالوں میں مدد کر سکتا ہوں۔ براہ کرم مجھ سے فلیٹس، گھر، کرایہ یا پراپرٹی خریدنے کے بارے میں پوچھیں!",
  hinglish: "Mujhe maafi chahiye! Main sirf HomeEase app par property se related sawaalon mein madad kar sakta hoon. Kripya mujhse flats, ghar, kiraya, ya property khareedne ke baare mein poochein!"
};

/**
 * Language-aware welcome messages.
 */
export const WELCOME_MESSAGES = {
  english: "Asalaam-o-Alaikum! I am HomeEase AI, your personal property assistant. Tell me — which city, how many rooms, what's your budget, and are you looking for rent or buy? I'll find the best options for you right away!",
  urdu: "اسلام علیکم! میں ہوم ایز اے آئی ہوں، آپ کا پرسنل پراپرٹی اسسٹنٹ۔ مجھے بتائیں — کونسا شہر، کتنے کمرے، کتنا بجٹ، اور کرایہ چاہیے یا خریدنا ہے؟ میں ابھی بہترین آپشنز ڈھونڈ کر دیتا ہوں!",
  hinglish: "Asalaam-o-Alaikum! Main HomeEase AI hoon, aapka personal property assistant. Mujhe batayein — kaunsa sheher, kitne kamre, budget kitna hai, aur kiraya chahiye ya khareedna? Main abhi best options dhundh kar deta hoon!"
};
