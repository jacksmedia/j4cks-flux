import { initHFClient } from '../../utils/huggingface';
import { imageGenerationLimiter } from '../../utils/rateLimit';

export const handler = async (event) => {
  // Rate limiting (Netlify-specific implementation)
  if (await rateLimitExceeded(event)) {
    return {
      statusCode: 429,
      body: JSON.stringify({ error: "Rate limit exceeded" })
    };
  }

  try {
    const { prompt } = JSON.parse(event.body);
    const client = initHFClient();
    const result = await client.textToImage({
      model: "black-forest-labs/FLUX.1-schnell",
      inputs: prompt
    });

    const buffer = Buffer.from(await result.arrayBuffer());
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        imageData: buffer.toString('base64')
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Generation failed" })
    };
  }
};