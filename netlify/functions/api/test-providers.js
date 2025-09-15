// handler for selecting correct Gen AI
import { InferenceClient } from "@huggingface/inference";
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
  
  const providers = ['hf', 'fal-ai'];
  const results = {};
  
  try{ //CORS

    for (const provider of providers) {
      try {
        const testClient = new InferenceClient({
          apiKey: process.env.HF_TOKEN,
          provider
        });
        await testClient.textToImage({
          model: "black-forest-labs/FLUX.1-schnell",
          inputs: "test image"
        });   
        results[provider] = { status: 'working' };
      } catch (error) {
        results[provider] = { 
          status: 'failed',
          error: error.message 
        };
      }
    }
    return addCorsHeaders({
      statusCode: 200,
      body: JSON.stringify({ results })
    });

  } catch (error) {
      return addCorsHeaders({
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    });
  }
};