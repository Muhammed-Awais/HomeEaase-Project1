const { z } = require("zod");
const Property = require("../models/Property");

// ─────────────────────────────────────────────────────────────────────────────
// Lazy-loaded ESM imports (Vercel AI SDK is ESM-only)
// ─────────────────────────────────────────────────────────────────────────────

let _ai = null;
let _groqProvider = null;

async function getAI() {
  if (!_ai) {
    _ai = await import("ai");
  }
  return _ai;
}

async function getGroq() {
  if (!_groqProvider) {
    const mod = await import("@ai-sdk/groq");
    _groqProvider = mod.createGroq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groqProvider;
}

// ─────────────────────────────────────────────────────────────────────────────
// Database query helper — properly handles ALL filter combinations
// ─────────────────────────────────────────────────────────────────────────────

const queryDatabase = async (filters) => {
  try {
    const andClauses = [];

    // City filter
    if (filters.city && filters.city.toLowerCase() !== "any") {
      andClauses.push({ city: new RegExp(filters.city.trim(), "i") });
    }

    // Bedrooms — exact match
    if (filters.bedrooms !== undefined && filters.bedrooms !== null) {
      andClauses.push({ bedrooms: parseInt(filters.bedrooms) });
    }

    // Bathrooms
    if (filters.bathrooms !== undefined && filters.bathrooms !== null) {
      andClauses.push({ bathrooms: parseInt(filters.bathrooms) });
    }

    // Price range
    if (filters.maxPrice) {
      andClauses.push({ price: { $lte: parseInt(filters.maxPrice) } });
    }
    if (filters.minPrice) {
      andClauses.push({ price: { $gte: parseInt(filters.minPrice) } });
    }

    // Furnishing
    if (filters.furnishing) {
      andClauses.push({ furnishing: new RegExp(filters.furnishing.trim(), "i") });
    }

    // Floor
    if (filters.floor) {
      andClauses.push({ floor: new RegExp(filters.floor.trim(), "i") });
    }

    // Property type — search in both type field AND title
    if (filters.type) {
      andClauses.push({
        $or: [
          { type: new RegExp(filters.type.trim(), "i") },
          { title: new RegExp(filters.type.trim(), "i") },
        ],
      });
    }

    // Build final query using $and for all active filters
    const query = andClauses.length > 0 ? { $and: andClauses } : {};

    // ── Structured diagnostics ──
    console.log("[DB Query]", JSON.stringify(query, (_k, v) => (v instanceof RegExp ? v.toString() : v)));

    const totalAll = await Property.countDocuments({});
    const totalFiltered = await Property.countDocuments(query);
    const totalAvailable = await Property.countDocuments({ ...query, isAvailable: true });

    console.log(
      `[DB Count] total_in_collection=${totalAll} | matches_filters=${totalFiltered} | matches_filters+isAvailable=${totalAvailable}`
    );

    // Use isAvailable filter only when it narrows results
    const finalQuery =
      totalAvailable > 0 ? { $and: [...(andClauses.length > 0 ? [query] : []), { isAvailable: true }] } : query;

    if (totalAvailable === 0 && totalFiltered > 0) {
      console.log("[DB Warn] isAvailable:true excluded all matches — querying without it");
    }

    const results = await Property.find(totalAvailable > 0 ? { ...query, isAvailable: true } : query)
      .sort({ price: 1 })
      .limit(5)
      .lean();

    console.log(`[DB Results] returning ${results.length} properties`);
    if (results.length > 0) {
      console.log(
        "[DB Sample]",
        JSON.stringify({
          _id: results[0]._id,
          title: results[0].title,
          city: results[0].city,
          type: results[0].type,
          bedrooms: results[0].bedrooms,
          isAvailable: results[0].isAvailable,
        })
      );
    }
    return results;
  } catch (error) {
    console.error("[DB Error]", error.message);
    return [];
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Natural language intent parser — extracts filters directly from user text
// This acts as a FALLBACK when the AI doesn't call the tool properly
// ─────────────────────────────────────────────────────────────────────────────

const CITIES = [
  "karachi", "lahore", "islamabad", "rawalpindi", "faisalabad", "multan",
  "peshawar", "quetta", "hyderabad", "sialkot", "gujranwala", "bahawalpur",
  "sargodha", "abbottabad", "sukkur", "larkana", "sheikhupura", "rahim yar khan",
];

const PROPERTY_TYPES = ["flat", "apartment", "house", "room", "portion", "studio", "plot", "shop", "office"];

function extractFiltersFromText(text) {
  const lower = text.toLowerCase();
  const filters = {};

  // City detection
  for (const city of CITIES) {
    if (lower.includes(city)) {
      filters.city = city.charAt(0).toUpperCase() + city.slice(1);
      break;
    }
  }

  // Property type detection
  for (const ptype of PROPERTY_TYPES) {
    if (lower.includes(ptype)) {
      filters.type = ptype;
      break;
    }
  }

  // Bedrooms detection — "3 bedroom", "3-bedroom", "three bedroom", "3 bed"
  const bedroomPatterns = [
    /(\d+)\s*[-\s]?bed(?:room)?s?/i,
    /(one|two|three|four|five|six)\s*bed(?:room)?s?/i,
  ];
  const wordToNum = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };
  for (const pattern of bedroomPatterns) {
    const match = lower.match(pattern);
    if (match) {
      const val = match[1];
      filters.bedrooms = wordToNum[val] !== undefined ? wordToNum[val] : parseInt(val);
      break;
    }
  }

  // Budget detection — "under 50000", "max 50k", "budget 30000"
  const budgetMatch = lower.match(/(?:under|max|budget|upto|up to|below)\s*(?:pkr\s*)?(\d[\d,]*)\s*k?/i);
  if (budgetMatch) {
    let amount = parseInt(budgetMatch[1].replace(/,/g, ""));
    if (lower.includes("k") && amount < 10000) amount *= 1000;
    filters.maxPrice = amount;
  }

  // Furnishing detection
  if (lower.includes("furnished") && !lower.includes("unfurnished") && !lower.includes("semi")) {
    filters.furnishing = "furnished";
  } else if (lower.includes("unfurnished")) {
    filters.furnishing = "unfurnished";
  } else if (lower.includes("semi")) {
    filters.furnishing = "semi-furnished";
  }

  return filters;
}

// ─────────────────────────────────────────────────────────────────────────────
// Parse raw function call text that models sometimes emit instead of tool calls
// Handles: <function=searchProperties>{...}</function>
// ─────────────────────────────────────────────────────────────────────────────

function parseRawFunctionCall(text) {
  try {
    const match = text.match(/<function=(\w+)>([\s\S]*?)<\/function>/i);
    if (!match) return null;
    const funcName = match[1];
    const argsText = match[2].trim();
    const args = JSON.parse(argsText);
    return { funcName, args };
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Format clean property results for the AI
// ─────────────────────────────────────────────────────────────────────────────

function formatResults(properties) {
  return properties.map((p) => ({
    _id: p._id?.toString(),
    id: p._id?.toString(),
    title: p.title,
    price: p.price,
    currency: p.currency || "PKR",
    city: p.city,
    location: p.location,
    propertyType: p.type,
    type: p.type,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    size: `${p.sizeValue} ${p.sizeUnit}`,
    furnishing: p.furnishing,
    purpose: p.purpose,
    amenities: p.amenities || [],
    images: p.images || [],
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// System Prompt
// ─────────────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are HomeEase AI, a friendly and highly conversational real estate assistant for a property rental app in Pakistan. You help users find rental properties.

CRITICAL RULES — FOLLOW EXACTLY:

1. TOOL CALLING: You have a tool called "searchProperties". Call this tool ONLY when the user is specifically asking to find, browse, or search for a rental property. Do NOT write raw function tags like <function=searchProperties> in your text.

2. DO NOT CALL THE TOOL for:
   - Greetings: "hi", "hello", "how are you"
   - Thanks: "thanks", "thank you", "great", "got it"
   - Off-topic questions: anything not related to finding a rental property in Pakistan
   - Follow-up acknowledgments or simple replies

3. SEARCH INTENT: Only call searchProperties when the user clearly wants to find a property:
   - "I want 3 bedroom house in Karachi" → call searchProperties with city="Karachi", bedrooms=3, type="house"
   - "flat for rent in Faisalabad" → call searchProperties with city="Faisalabad", type="flat"
   - "show me properties" → call searchProperties with no filters

4. EXTRACT ALL FILTERS: From the user's message, always extract:
   - city (Karachi, Lahore, Faisalabad, Islamabad, Rawalpindi, Multan, etc.)
   - bedrooms (1, 2, 3, 4 — any number mentioned before "bed" or "bedroom")
   - type (house, flat, apartment, room, portion, studio, shop, office)
   - furnishing (furnished, semi-furnished, unfurnished)
   - budget/price range

5. CONVERSATIONAL TONE: Sound like a warm, helpful human agent. Never say "I found X properties." Instead say things like "I've pulled up some great options for you!" or "Great news! Here's what I found."

6. NO RESULTS: If the tool returns no results, be empathetic: "I couldn't find an exact match right now — would you like to try a nearby city or adjust the bedroom count?"

7. RENT ONLY: HomeEase is for renting only. If someone asks to buy, explain you specialize in rentals.

8. NO HALLUCINATION: Only discuss property details that appear in the tool results. Never invent addresses, prices, or features.

9. IDENTITY: You are HomeEase AI. Never mention Groq, LLaMA, or any AI model names.

10. OFF-TOPIC: If the question is not about real estate in Pakistan (e.g. questions about celebrities, sports, history), do NOT call any tool. Just politely say you can only assist with property rentals.`;

// ─────────────────────────────────────────────────────────────────────────────
// Tool schema
// ─────────────────────────────────────────────────────────────────────────────

const searchPropertiesSchema = z.object({
  city: z.string().optional().describe("City name, e.g. Lahore, Karachi, Faisalabad. Include whenever the user mentions a city."),
  bedrooms: z.number().optional().describe("Number of bedrooms. Extract from phrases like '3 bedroom', '2 bed', 'three bedrooms'."),
  bathrooms: z.number().optional().describe("Number of bathrooms, if explicitly mentioned."),
  budget: z.number().optional().describe("Maximum monthly rent budget in PKR."),
  minPrice: z.number().optional().describe("Minimum price in PKR if user specifies a range."),
  furnishing: z.string().optional().describe("Furnishing status: furnished, semi-furnished, or unfurnished."),
  type: z.string().optional().describe("Property type: flat, apartment, house, room, portion, studio, plot, shop, office."),
});

// ─────────────────────────────────────────────────────────────────────────────
// Execute tool and return clean results
// ─────────────────────────────────────────────────────────────────────────────

async function executeSearchTool(params) {
  const filters = {};
  if (params.city) filters.city = params.city;
  if (params.bedrooms !== undefined) filters.bedrooms = params.bedrooms;
  if (params.bathrooms !== undefined) filters.bathrooms = params.bathrooms;
  if (params.budget) filters.maxPrice = params.budget;
  if (params.minPrice) filters.minPrice = params.minPrice;
  if (params.furnishing) filters.furnishing = params.furnishing;
  if (params.type) filters.type = params.type;

  console.log("[Tool Call] searchProperties:", JSON.stringify(filters));
  const results = await queryDatabase(filters);
  console.log(`[Tool Result] DB returned ${results.length} properties`);

  if (results.length === 0) {
    return {
      found: 0,
      message: "No properties matched the criteria.",
      results: [],
    };
  }

  return {
    found: results.length,
    results: formatResults(results),
    instruction: "You now have the results. Write a brief, warm, conversational reply introducing the properties. Do NOT call searchProperties again.",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Generate a conversational reply using AI (no tool calls — just text generation)
// ─────────────────────────────────────────────────────────────────────────────

async function generateConversationalReply(userMessage, searchResults, filters) {
  try {
    const { generateText } = await getAI();
    const groq = await getGroq();

    const filterDesc = Object.entries(filters)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");

    const resultsDesc =
      searchResults.length === 0
        ? "No properties found matching the criteria."
        : searchResults
            .map(
              (p, i) =>
                `${i + 1}. ${p.title} - ${p.currency} ${p.price}/mo, ${p.bedrooms} bed, ${p.city}, ${p.type}, ${p.furnishing}`
            )
            .join("\n");

    const prompt = searchResults.length === 0
      ? `The user asked: "${userMessage}". Search filters used: ${filterDesc || "none"}. No matching properties were found. Write a warm, empathetic 1-2 sentence response suggesting they broaden their search (different city, or fewer bedroom requirements). Do NOT use robotic phrases.`
      : `The user asked: "${userMessage}". You searched for properties with filters: ${filterDesc || "none"}. Here are the results found:\n${resultsDesc}\n\nWrite a warm, friendly 1-2 sentence reply introducing these properties naturally. Do NOT list them — they are shown as cards below your message. Sound like a human agent.`;

    const result = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
      maxTokens: 256,
    });

    return result.text?.trim() || (searchResults.length > 0
      ? `Great news! I've found ${searchResults.length} propert${searchResults.length === 1 ? "y" : "ies"} matching your search.`
      : "I couldn't find any exact matches right now. Would you like to try a different city or adjust your requirements?");
  } catch (err) {
    console.error("[Reply Gen Error]", err.message);
    return searchResults.length > 0
      ? `I found ${searchResults.length} propert${searchResults.length === 1 ? "y" : "ies"} for you!`
      : "I couldn't find any exact matches. Try adjusting your search criteria.";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Intent classifier — runs BEFORE AI to avoid wasting tool calls
// ─────────────────────────────────────────────────────────────────────────────

const PROPERTY_KEYWORDS = /house|flat|apartment|room|portion|studio|shop|office|propert|rent|bedroom|\bbed\b|karachi|lahore|islamabad|rawalpindi|faisalabad|multan|peshawar|quetta|hyderabad|sialkot|gujranwala|bahawalpur|sargodha|show me|find me|looking for|available|furnished|2bhk|3bhk|\d\s*bed/i;

const GREETING_PATTERNS = /^(hi+|hello+|hey+|salam|assalam|good\s*(morning|evening|afternoon|night)|howdy|what'?s\s*up|how are you|how r u|aoa|aos|hiya)\b/i;

const THANKS_PATTERNS = /^(thanks|thank\s*you|thank\s*u|thankyou|shukriya|jazak|appreciated|ok\s*thanks|okay\s*thanks|got\s*it|that'?s?\s*(great|good|nice|perfect|amazing|awesome|wonderful|cool)|sounds\s*good|great|awesome|perfect|nice|good|cool|okay|ok|alright|sure|yep|yup|np|no\s*prob|no\s*worries)\b/i;

function classifyIntent(message) {
  const trimmed = message.trim();
  const lower = trimmed.toLowerCase();

  // If it contains any property keyword it is ALWAYS a search
  if (PROPERTY_KEYWORDS.test(lower)) return 'PROPERTY_SEARCH';

  // Short messages first — greetings
  if (GREETING_PATTERNS.test(lower)) return 'GREETING';

  // Thanks / acknowledgments
  if (THANKS_PATTERNS.test(lower)) return 'THANKS';

  // Default: off-topic
  return 'OFF_TOPIC';
}

const GREETING_REPLIES = [
  "Hello! 👋 I'm HomeEase AI, your personal property rental assistant for Pakistan. Tell me — which city are you looking to rent in, and what type of home do you need?",
  "Hey there! 😊 Welcome to HomeEase AI. I'm here to help you find the perfect rental. Which city are you searching in?",
  "Hi! 🏠 Great to have you here. I can search for flats, houses, rooms, and more across Pakistan. Where would you like to look?",
];

const THANKS_REPLIES = [
  "You're welcome! 😊 Feel free to ask anytime you need help finding a rental.",
  "Happy to help! 🏠 If you'd like to explore more options or have any other questions, just let me know.",
  "My pleasure! Don't hesitate to ask if you need anything else. 😊",
  "Glad I could help! Let me know if you'd like to search for more properties.",
];

const OFFTOPIC_REPLIES = [
  "I'm HomeEase AI, specialized in property rentals across Pakistan — so that's a bit outside my area! 😅 But I'd love to help you find a great rental home. Which city are you looking in?",
  "That's not something I can help with, but I'm an expert at finding rental properties in Pakistan! 🏠 What are you looking for?",
  "I can only assist with rental properties in Pakistan, so I'll have to skip that one! 😊 Are you looking for a flat, house, or room somewhere?",
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─────────────────────────────────────────────────────────────────────────────
// Main chat processor
// ─────────────────────────────────────────────────────────────────────────────

const processChatMessage = async (message, history = []) => {
  try {
    // ── Step 0: Classify intent — short-circuit non-property messages immediately ──
    const intent = classifyIntent(message);
    console.log(`[Intent] "${message.substring(0, 60)}" → ${intent}`);

    if (intent === 'GREETING') {
      return { reply: pickRandom(GREETING_REPLIES), listings: [], filters: {} };
    }
    if (intent === 'THANKS') {
      return { reply: pickRandom(THANKS_REPLIES), listings: [], filters: {} };
    }
    if (intent === 'OFF_TOPIC') {
      return { reply: pickRandom(OFFTOPIC_REPLIES), listings: [], filters: {} };
    }

    // ── Step 1: Try AI tool calling with llama-3.3-70b-versatile ──
    const { generateText, tool, stepCountIs } = await getAI();
    const groq = await getGroq();

    const searchPropertiesTool = tool({
      description:
        "Search available rental property listings in the HomeEase database. ALWAYS call this tool when a user wants to find, browse, or filter properties. Extract city, bedrooms, type, and any other filters from the user's message.",
      inputSchema: searchPropertiesSchema,
      execute: executeSearchTool,
    });

    const messages = [
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: "user", content: message },
    ];

    let result;
    try {
      result = await generateText({
        model: groq("llama-3.3-70b-versatile"),
        system: SYSTEM_PROMPT,
        messages,
        tools: { searchProperties: searchPropertiesTool },
        stopWhen: stepCountIs(5),
        temperature: 0.3,
        maxTokens: 1024,
      });
    } catch (modelErr) {
      // Fallback to smaller model if 70b fails (e.g. rate limit)
      console.warn("[AI] 70b model failed, falling back to 8b:", modelErr.message);
      result = await generateText({
        model: groq("llama-3.1-8b-instant"),
        system: SYSTEM_PROMPT,
        messages,
        tools: { searchProperties: searchPropertiesTool },
        stopWhen: stepCountIs(5),
        temperature: 0.3,
        maxTokens: 1024,
      });
    }

    console.log("[AI Result] finishReason:", result.finishReason);
    console.log("[AI Result] text length:", result.text?.length || 0);
    console.log("[AI Result] steps:", result.steps?.length || 0);
    if (result.steps) {
      result.steps.forEach((step, i) => {
        console.log(
          `  Step ${i}: finishReason=${step.finishReason}, toolCalls=${step.toolCalls?.length || 0}, toolResults=${step.toolResults?.length || 0}, text="${step.text?.substring(0, 120) || ""}"`
        );
      });
    }

    // ── Step 2: Extract listings and filters from tool results ──
    let listings = [];
    let extractedFilters = {};

    if (result.steps) {
      for (const step of result.steps) {
        if (step.toolCalls) {
          for (const tc of step.toolCalls) {
            if (tc.toolName === "searchProperties") {
              const args = tc.input ?? tc.args ?? {};
              extractedFilters = { ...extractedFilters, ...args };
            }
          }
        }
        if (step.toolResults) {
          for (const tr of step.toolResults) {
            const payload = tr.output ?? tr.result;
            if (payload && payload.results && payload.results.length > 0) {
              listings = payload.results;
            }
          }
        }
      }
    }

    console.log(`[Extract] listings=${listings.length}, filters=${JSON.stringify(extractedFilters)}`);

    let reply = result.text?.trim();

    // ── Step 3: Detect raw <function=...> tags in reply (model failure fallback) ──
    if (reply && reply.includes("<function=")) {
      console.warn("[AI] Detected raw function call in text — executing manually");
      const parsed = parseRawFunctionCall(reply);
      if (parsed && parsed.funcName === "searchProperties") {
        const toolResult = await executeSearchTool(parsed.args);
        listings = toolResult.results || [];
        extractedFilters = { ...parsed.args };
        // Generate a natural reply
        reply = await generateConversationalReply(message, listings, extractedFilters);
      } else {
        reply = null; // Will be handled below
      }
    }

    // ── Step 4: If no tool was called but message has search intent, run manual search ──
    const hasSearchIntent =
      /house|flat|apartment|room|portion|studio|shop|office|propert|rent|bedroom|bed|karachi|lahore|islamabad|rawalpindi|faisalabad|multan|peshawar|quetta|hyderabad|sialkot|gujranwala|show me|find me|looking for|available/i.test(
        message
      );

    if (listings.length === 0 && Object.keys(extractedFilters).length === 0 && hasSearchIntent) {
      console.log("[AI] No tool was called but search intent detected — running NLP fallback");
      extractedFilters = extractFiltersFromText(message);
      if (Object.keys(extractedFilters).length > 0) {
        const dbResults = await queryDatabase(extractedFilters);
        listings = formatResults(dbResults);
        console.log(`[Fallback] NLP extracted filters: ${JSON.stringify(extractedFilters)}, found ${listings.length} results`);
        reply = await generateConversationalReply(message, listings, extractedFilters);
      }
    }

    // ── Step 5: Handle empty or missing reply ──
    if (!reply || reply.trim().length === 0) {
      if (listings.length > 0) {
        reply = `Great news! I've found ${listings.length} propert${listings.length === 1 ? "y" : "ies"} that match what you're looking for.`;
      } else if (Object.keys(extractedFilters).length > 0) {
        reply = "I couldn't find any exact matches for your search right now. Would you like to try a different city or adjust your requirements?";
      } else {
        reply = "I'm here to help you find your perfect rental! Could you tell me which city you're looking in and what type of property you need?";
      }
    }

    return { reply, listings, filters: extractedFilters };
  } catch (error) {
    if (error.status === 429 || (error.message && error.message.includes("rate"))) {
      throw new Error("RATE_LIMIT_ERROR");
    }
    console.error("AI Service Error:", error);
    throw error;
  }
};

module.exports = { processChatMessage };
