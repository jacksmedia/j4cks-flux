import { InferenceClient } from "@huggingface/inference";

// Simple in-memory rate limiting per IP
const rateMap = new Map();
const RATE_LIMIT_WINDOW = 4 * 60 * 60 * 1000; // 4 hours
const RATE_LIMIT_MAX = 3;

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateMap.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW) {
    rateMap.set(ip, { windowStart: now, count: 1 });
    return null;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((entry.windowStart + RATE_LIMIT_WINDOW - now) / 1000);
    return {
      error: "Too many requests",
      message: `Rate limit exceeded. You can make ${RATE_LIMIT_MAX} requests per 4 hours.`,
      retryAfter,
      resetTime: new Date(entry.windowStart + RATE_LIMIT_WINDOW).toISOString(),
    };
  }

  entry.count++;
  return null;
}

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Rate limiting
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown";
  const rateLimited = checkRateLimit(ip);
  if (rateLimited) {
    return res.status(429).json(rateLimited);
  }

  // Validate HF_TOKEN
  if (!process.env.HF_TOKEN) {
    console.error("HF_TOKEN is missing from environment variables");
    return res.status(500).json({
      error: "Server configuration error",
      message: "Image generation is currently unavailable.",
    });
  }

  const { model, prompt } = req.body || {};

  // Validate prompt
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({
      error: "Invalid prompt",
      message: "Prompt must be a non-empty string",
    });
  }

  if (prompt.length > 500) {
    return res.status(400).json({
      error: "Prompt too long",
      message: "Prompt must be 500 characters or less",
    });
  }

  try {
    // Try with explicit HF provider first, fallback to auto
    let result;
    try {
      const hfClient = new InferenceClient({
        apiKey: process.env.HF_TOKEN,
        provider: "hf",
      });

      result = await hfClient.textToImage({
        model,
        inputs: prompt,
      });
    } catch (providerError) {
      console.log("HF provider failed, trying auto-selection:", providerError.message);

      const autoClient = new InferenceClient(process.env.HF_TOKEN);
      result = await autoClient.textToImage({
        model: "black-forest-labs/FLUX.1-schnell",
        inputs: prompt,
      });
    }

    // Convert Blob to base64
    const buffer = Buffer.from(await result.arrayBuffer());
    const base64Image = buffer.toString("base64");

    return res.status(200).json({
      imageData: base64Image,
      meta: {
        model,
        timestamp: new Date().toISOString(),
        promptLength: prompt.length,
      },
    });
  } catch (error) {
    console.error("Image generation error:", error.message);

    return res.status(500).json({
      error: "Image generation failed",
      message: "Failed to generate image. Please try again.",
      timestamp: new Date().toISOString(),
    });
  }
}
