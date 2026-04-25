import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

const API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? "";
const OPENAI_IMAGE_EDIT_URL = "https://api.openai.com/v1/images/edits";

const STYLE_CONFIGS: Record<string, { prompt: string }> = {
  "1": {
    prompt: "Redesign this room in modern interior style with clean geometric lines, neutral whites and light grays, sleek sofa with metal legs, glass coffee table, recessed LED lighting, polished hardwood floors, bright airy atmosphere.",
  },
  "2": {
    prompt: "Redesign this room in bohemian interior style with warm earthy tones, rattan furniture, terracotta accents, layered Moroccan rugs, colorful throw pillows, hanging plants, warm ambient lantern lighting.",
  },
  "3": {
    prompt: "Redesign this room in minimalist interior style with only essential furniture, open floor space, monochromatic white and gray scheme, simple geometric shapes, soft natural daylight, matte white walls.",
  },
  "4": {
    prompt: "Redesign this room in industrial loft style with exposed brick walls, concrete floors, black iron elements, Edison bulb pendant lighting, reclaimed dark wood furniture, black metal pipe shelving.",
  },
  "5": {
    prompt: "Redesign this room in Scandinavian interior style with light birch wood furniture, crisp white and soft gray walls, wool throw blankets, sage green accents, linen cushions, potted plants, warm candlelight.",
  },
  "6": {
    prompt: "Redesign this room in Art Deco style with bold geometric patterns, jewel tones of teal and emerald with gold accents, velvet upholstery, mirrored surfaces, lacquered furniture, marble with brass trim.",
  },
};

export async function resizeImage(uri: string): Promise<string> {
  const result = await manipulateAsync(
    uri,
    [{ resize: { width: 1024 } }],
    { compress: 0.9, format: SaveFormat.PNG }
  );
  return result.uri;
}

export async function transformRoom(
  imageUri: string,
  styleId: string,
  onWarming?: () => void
): Promise<string> {
  const config = STYLE_CONFIGS[styleId];
  if (!config) throw new Error(`Unknown style: ${styleId}`);
  if (!API_KEY || API_KEY === "your_openai_api_key_here") {
    throw new Error("OpenAI API key is not configured. Add EXPO_PUBLIC_OPENAI_API_KEY to your .env file.");
  }

  onWarming?.();

  const resizedUri = await resizeImage(imageUri);

  const formData = new FormData();
  formData.append("model", "gpt-image-1");
  formData.append("image", {
    uri: resizedUri,
    type: "image/png",
    name: "room.png",
  } as any);
  formData.append("prompt", config.prompt);
  formData.append("n", "1");
  formData.append("size", "1024x1024");

  const response = await fetch(OPENAI_IMAGE_EDIT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    const message =
      (errBody as any)?.error?.message ?? `OpenAI API error (${response.status})`;
    throw new Error(message);
  }

  const json = (await response.json()) as { data: { b64_json: string }[] };
  const b64 = json?.data?.[0]?.b64_json;
  if (!b64) throw new Error("No image returned from OpenAI.");

  return `data:image/png;base64,${b64}`;
}
