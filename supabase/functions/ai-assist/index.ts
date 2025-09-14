// Fix: Replaced invalid Deno types reference with a valid one for Supabase Edge Functions to resolve TS errors.
/// <reference types="https://esm.sh/@supabase/functions-js@2/src/edge-runtime.d.ts" />

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { GoogleGenAI } from 'npm:@google/genai';

// Add CORS headers to handle preflight requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Get Gemini API Key from Supabase environment variables
    const API_KEY = Deno.env.get('API_KEY');
    if (!API_KEY) {
        throw new Error("Missing API_KEY environment variable.");
    }
    
    // 2. Initialize the Gemini client
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const model = 'gemini-2.5-flash';

    // 3. Get the prompt from the request body
    const { prompt } = await req.json();
    if (!prompt) {
        return new Response(JSON.stringify({ error: 'No prompt provided' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }

    // 4. Call the Gemini API
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    
    const text = response.text;

    // 5. Return the response
    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})