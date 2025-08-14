import { InferenceClient } from "@huggingface/inference";

export const initHFClient = () => {
  if (!process.env.HF_TOKEN) throw new Error("HF_TOKEN missing");
  return new InferenceClient({ 
    apiKey: process.env.HF_TOKEN,
    provider: "hf"
  });
};