// handler for LLM prompt
import fetch from "node-fetch";
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
        body: JSON.stringify({ error: "Missing or invalid prompt" })
      });
    }

    if (prompt.length > 500) {
      return addCorsHeaders({
        statusCode: 400,
        body: JSON.stringify({ error: "Prompt too long: 500 character maximum" })
      });
    }

    const HF_TOKEN = process.env.HF_TOKEN;
    if (!HF_TOKEN) {
      return addCorsHeaders({
        statusCode: 500,
        body: JSON.stringify({ error: "Server configuration error: Missing HuggingFace token" })
      });
    }

    // Calls Hugging Face Inference API ☎
    const response = await fetch(
      "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HuggingFace API error:', response.status, errorText);
      
      return addCorsHeaders({
        statusCode: response.status,
        body: JSON.stringify({ 
          error: "HuggingFace API request failed",
          details: process.env.NODE_ENV === 'development' ? errorText : undefined
        })
      });
    }

    // Handles different response types ❓
    const contentType = response.headers.get('content-type');
    let result;

    if (contentType?.includes('application/json')) {
      result = await response.json();
    } else if (contentType?.includes('image/')) {
      const buffer = await response.arrayBuffer();
      result = {
        imageData: Buffer.from(buffer).toString('base64'),
        contentType: contentType
      };
    } else {
      // Fallback for unknown content types 🛏
      result = await response.text();
    }

    return addCorsHeaders({
      statusCode: 200,
      body: JSON.stringify(result),
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Generate function error:', error);
    
    return addCorsHeaders({
      statusCode: 500,
      body: JSON.stringify({ 
        error: "Image generation failed",
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      })
    });
  }
};