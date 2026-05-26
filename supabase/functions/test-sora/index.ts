import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const SORA_API_KEY = Deno.env.get("SORA_API_KEY");
    console.log("SORA_API_KEY exists:", !!SORA_API_KEY);

    const testPrompt = "A beautiful cinematic scene of nature";

    console.log("Calling Sora API with prompt:", testPrompt);

    const response = await fetch("https://api.sora2api.ai/api/v1/sora2api/generate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SORA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: testPrompt,
        aspectRatio: "portrait",
        quality: "hd",
      }),
    });

    const responseText = await response.text();
    console.log("Response status:", response.status);
    console.log("Response text:", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      data = { raw: responseText };
    }

    const result = {
      success: response.ok,
      status: response.status,
      headers: {
        contentType: response.headers.get("content-type"),
      },
      data,
      taskId: data?.data?.taskId || data?.taskId,
      successFlag: data?.data?.successFlag,
      response: data?.data?.response,
    };

    console.log("Final result:", JSON.stringify(result));

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
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
