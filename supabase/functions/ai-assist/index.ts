// FIX: The /// <reference> path was causing a type resolution error in the provided environment.
// The 'Deno' global is available in the Supabase Edge Function runtime,
// so we declare it as 'any' to satisfy the TypeScript compiler without changing the runtime behavior.
declare const Deno: any;

import { GoogleGenAI } from "@google/genai";

// Add CORS headers to handle preflight requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: any) => {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Get Gemini API Key from Supabase environment variables
    // This is a secure way to store secrets.
    const API_KEY = Deno.env.get('API_KEY');
    if (!API_KEY) {
      throw new Error("Missing API_KEY environment variable in Supabase project.");
    }
    
    // 2. Initialize the Gemini client securely on the server
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    // 3. Get the prompt from the request body
    const { prompt } = await req.json();
    if (!prompt) {
      return new Response(JSON.stringify({ error: 'No prompt provided' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // 4. Call the Gemini API using the recommended `ai.models.generateContent`
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    // 5. Extract the text response correctly using the `.text` property
    const text = response.text;

    // 6. Return the successful response
    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    console.error("Error in ai-assist Edge Function:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
