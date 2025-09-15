// main request
import { initHFClient } from '../../utils/huggingface';
import { checkRateLimit } from '../../utils/rateLimit';
import { addCorsHeaders } from '../../utils/cors.js';

export const handler = async (event) => {
  // Handles CORS 😡
  if (event.httpMethod === 'OPTIONS') {
    return addCorsHeaders({
      statusCode: 200,
      body: ''
    });
  }

  // Only allows POST requests 🛑
  if (event.httpMethod !== 'POST') {
    return addCorsHeaders({
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    });
  }

  try { // CORS
    
    // Rate limiting logic 🚦
    const ip = event.headers['client-ip'] || event.headers['x-nf-request-id'] || 'unknown';
    
    if (checkRateLimit(ip)) {
      return addCorsHeaders({
        statusCode: 429,
        body: JSON.stringify({ 
          error: "Rate limit exceeded",
          message: `You can only make ${process.env.NODE_ENV === 'production' ? 3 : 1} requests per ${process.env.NODE_ENV === 'production' ? '4 hours' : 'minute'}`
        })
      });
    }

    // Parses and validates request 🔃
    if (!event.body) {
      return addCorsHeaders({
        statusCode: 400,
        body: JSON.stringify({ error: "Missing request body" })
      });
    }

    const { prompt } = JSON.parse(event.body);
    
    if (!prompt || typeof prompt !== 'string') {
      return addCorsHeaders({
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid prompt: must be a non-empty string" })
      });
    }

    if (prompt.length > 500) {
      return addCorsHeaders({
        statusCode: 400,
        body: JSON.stringify({ error: "Prompt too long: must be 500 characters or less" })
      });
    }

    // Generates image ✨
    const client = initHFClient();
    const result = await client.textToImage({
      model: "black-forest-labs/FLUX.1-schnell",
      inputs: prompt
    });

    const buffer = Buffer.from(await result.arrayBuffer());
    
    return addCorsHeaders({
      statusCode: 200,
      body: JSON.stringify({
        imageData: buffer.toString('base64'),
        meta: {
          model: "black-forest-labs/FLUX.1-schnell",
          timestamp: new Date().toISOString(),
          promptLength: prompt.length
        }
      })
    });
    
  } catch (error) {
    console.error('Query function error:', error);
    
    return addCorsHeaders({
      statusCode: 500,
      body: JSON.stringify({ 
        error: "Image generation failed",
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      })
    });
  }
};