import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SoraRequest {
  prompt: string;
  aspectRatio?: string;
  quality?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { prompt, aspectRatio = "portrait", quality = "hd" }: SoraRequest = await req.json();

    const SORA_API_KEY = Deno.env.get("SORA_API_KEY");

    const response = await fetch("https://api.sora2api.ai/api/v1/sora2api/generate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SORA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        aspectRatio,
        quality,
      }),
    });

    if (!response.ok) {
      throw new Error(`Sora API error: ${response.status}`);
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({
        success: true,
        taskId: data.data?.taskId || data.taskId,
        data: data.data,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
