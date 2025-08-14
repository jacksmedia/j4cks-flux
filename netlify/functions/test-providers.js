import { InferenceClient } from "@huggingface/inference";

export const handler = async (event) => {
  const providers = ['hf', 'fal-ai'];
  const results = {};
  
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
  
  return {
    statusCode: 200,
    body: JSON.stringify({ results })
  };
};