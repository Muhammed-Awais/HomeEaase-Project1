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
// Database query helper
// ─────────────────────────────────────────────────────────────────────────────

const queryDatabase = async (filters) => {
  try {
    const query = {};

    if (filters.bedrooms) query.bedrooms = parseInt(filters.bedrooms);
    if (filters.city) query.city = new RegExp(filters.city, "i");
    if (filters.type) query.type = new RegExp(filters.type, "i");
    if (filters.purpose) query.purpose = new RegExp(filters.purpose, "i");
    if (filters.furnishing) query.furnishing = new RegExp(filters.furnishing, "i");
    if (filters.floor) query.floor = new RegExp(filters.floor, "i");

    if (filters.maxPrice) {
      query.price = { $lte: parseInt(filters.maxPrice) };
    }
    if (filters.minPrice) {
      query.price = { ...(query.price || {}), $gte: parseInt(filters.minPrice) };
    }

    // ── Structured diagnostics ──
    console.log("[DB Query]", JSON.stringify(query, (_k, v) => v instanceof RegExp ? v.toString() : v));

    const totalAll = await Property.countDocuments({});
    const totalFiltered = await Property.countDocuments(query);
    const totalAvailable = await Property.countDocuments({ ...query, isAvailable: true });

    console.log(`[DB Count] total_in_collection=${totalAll} | matches_filters=${totalFiltered} | matches_filters+isAvailable=${totalAvailable}`);

    // Use isAvailable filter only when it narrows results (guards against docs missing the field)
    const finalQuery = totalAvailable > 0 ? { ...query, isAvailable: true } : query;
    if (totalAvailable === 0 && totalFiltered > 0) {
      console.log("[DB Warn] isAvailable:true excluded all matches — querying without it");
    }

    const results = await Property.find(finalQuery).sort({ price: 1 }).limit(5).lean();
    console.log(`[DB Results] returning ${results.length} properties`);
    if (results.length > 0) {
      console.log("[DB Sample]", JSON.stringify({ _id: results[0]._id, title: results[0].title, city: results[0].city, type: results[0].type, isAvailable: results[0].isAvailable }));
    }
    return results;
  } catch (error) {
    console.error("[DB Error]", error.message);
    return [];
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// System Prompt
// ─────────────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are **HomeEase AI**, a professional and concise real estate assistant for the HomeEase property app in Pakistan.

### RULES:
1. **Scope**: You ONLY answer questions related to the HomeEase app — property search, rent, buy, listings, pricing, amenities, property types, and general real estate guidance in Pakistan.
2. **Off-topic**: If the user asks anything unrelated to real estate or the HomeEase app, politely decline in ONE short sentence. Example: "I can only assist with property-related queries on HomeEase."
3. **Greetings**: If the user greets you (hi, hello, hey, salam, etc.), welcome them warmly and briefly mention you can help with property search.
4. **Concise**: Keep every answer short and direct. No bullet lists unless the user asks for multiple items. No follow-up questions — just answer and stop.
5. **Tool Usage**: When the user asks about properties or listings, call the searchProperties tool ONCE. After receiving the tool result, immediately write your text reply — NEVER call searchProperties more than once per user message.
6. **No Results**: If the tool returns 0 results, say so in one sentence. Do not suggest alternatives unless asked.
7. **Identity**: You are HomeEase AI. Never mention Groq, LLaMA, Meta, or any AI model names. If asked what you are, say "I am HomeEase AI, your property assistant."
8. **Language**: Always respond in English.
9. **Property Type Synonyms**: Map user terminology to the correct propertyType before calling the tool:
   - "home", "homes", "house", "houses", "bungalow", "villa", "makan" → house
   - "flat", "flats" → flat
   - "apartment", "apartments", "apt" → apartment
   - "room", "rooms", "kamra" → room
   - "portion", "portions" → portion
   - "studio", "studios" → studio
   - "plot", "plots", "land" → plot
   - "shop", "shops", "dukan" → shop
   - "office", "offices" → office
   If the user says anything above you can still call the tool with the normalized propertyType (e.g. "house") to get correct results you can show data about the properties.`;

// ─────────────────────────────────────────────────────────────────────────────
// Property type synonym normalizer
// ─────────────────────────────────────────────────────────────────────────────

const PROPERTY_TYPE_SYNONYMS = {
  house: ["home", "homes", "houses", "bungalow", "bungalows", "villa", "villas", "makan"],
  flat: ["flats"],
  apartment: ["apartments", "apt", "apts"],
  room: ["rooms", "kamra"],
  portion: ["portions"],
  studio: ["studios"],
  plot: ["plots", "land"],
  shop: ["shops", "dukan"],
  office: ["offices"],
};

const synonymToCanonical = (() => {
  const map = {};
  for (const [canonical, aliases] of Object.entries(PROPERTY_TYPE_SYNONYMS)) {
    map[canonical] = canonical;
    for (const alias of aliases) map[alias] = canonical;
  }
  return map;
})();

function normalizePropertyType(raw) {
  if (!raw) return undefined;
  return synonymToCanonical[raw.toLowerCase().trim()] ?? raw.toLowerCase().trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool schema defined with Zod (required for correct Groq function calling)
// ─────────────────────────────────────────────────────────────────────────────

const searchPropertiesSchema = z.object({
  city: z.string().optional().describe("City name, e.g. Lahore, Karachi, Islamabad, Faisalabad"),
  propertyType: z.string().optional().describe("Property type: flat, apartment, house, room, portion, studio, plot, shop, or office"),
  bedrooms: z.number().optional().describe("Number of bedrooms"),
  bathrooms: z.number().optional().describe("Number of bathrooms"),
  budget: z.number().optional().describe("Maximum budget/price in PKR"),
  minPrice: z.number().optional().describe("Minimum price in PKR"),
  purpose: z.string().optional().describe("Purpose: rent, buy, or sale"),
  furnishing: z.string().optional().describe("Furnishing: furnished, semi-furnished, or unfurnished"),
});

// ─────────────────────────────────────────────────────────────────────────────
// Main chat processor
// ─────────────────────────────────────────────────────────────────────────────

const processChatMessage = async (message, history = []) => {
  try {
    const { generateText, tool, stepCountIs } = await getAI();
    const groq = await getGroq();

    const searchPropertiesTool = tool({
      description:
        "Search available property listings in the HomeEase database. Call this whenever the user wants to find, browse, or filter properties to rent or buy in Pakistan.",
      inputSchema: searchPropertiesSchema,
      execute: async (params) => {
        const filters = {};
        if (params.city) filters.city = params.city;
        if (params.propertyType) filters.type = normalizePropertyType(params.propertyType);
        if (params.bedrooms) filters.bedrooms = params.bedrooms;
        if (params.bathrooms) filters.bathrooms = params.bathrooms;
        if (params.budget) filters.maxPrice = params.budget;
        if (params.minPrice) filters.minPrice = params.minPrice;
        if (params.purpose) filters.purpose = params.purpose;
        if (params.furnishing) filters.furnishing = params.furnishing;

        console.log("[Tool Call] searchProperties:", JSON.stringify(filters));
        const results = await queryDatabase(filters);
        console.log(`[Tool Result] DB returned ${results.length} properties to AI`);

        if (results.length === 0) {
          return { found: 0, message: "No properties matched the criteria. Inform the user and stop.", results: [] };
        }

        const cleanResults = results.map((p) => ({
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

        return { found: results.length, results: cleanResults, instruction: "You now have the results. Write a brief text reply to the user. Do NOT call searchProperties again." };
      },
    });

    const messages = [
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: "user", content: message },
    ];

    const result = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: SYSTEM_PROMPT,
      messages,
      tools: { searchProperties: searchPropertiesTool },
      stopWhen: stepCountIs(5),
      temperature: 0.4,
      maxTokens: 1024,
    });

    console.log("[AI Result] finishReason:", result.finishReason);
    console.log("[AI Result] text length:", result.text?.length || 0);
    console.log("[AI Result] steps:", result.steps?.length || 0);
    if (result.steps) {
      result.steps.forEach((step, i) => {
        console.log(
          `  Step ${i}: finishReason=${step.finishReason}, toolCalls=${step.toolCalls?.length || 0}, toolResults=${step.toolResults?.length || 0}, text="${step.text?.substring(0, 80) || ""}"`
        );
      });
    }

    // ── Extract listings from tool results ──
    // ai@6.x uses tc.input (not tc.args) and tr.output (not tr.result)
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
            // ai@6.x: tr.output; older SDKs: tr.result
            const payload = tr.output ?? tr.result;
            if (payload && payload.results && payload.results.length > 0) {
              listings = payload.results;
            }
          }
        }
      }
    }

    console.log(`[Extract] listings=${listings.length}, filters=${JSON.stringify(extractedFilters)}, finishReason=${result.finishReason}`);

    let reply = result.text;

    if (!reply || reply.trim().length === 0) {
      if (listings.length > 0) {
        reply = `I found ${listings.length} propert${listings.length === 1 ? "y" : "ies"} matching your criteria.`;
      } else if (Object.keys(extractedFilters).length > 0) {
        reply = "No properties matched your criteria. Try adjusting your filters.";
      } else {
        reply = "I couldn't generate a response. Please try again.";
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
