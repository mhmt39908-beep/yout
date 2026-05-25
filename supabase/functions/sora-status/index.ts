import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const taskId = url.searchParams.get("taskId");

    if (!taskId) {
      throw new Error("taskId is required");
    }

    const SORA_API_KEY = Deno.env.get("SORA_API_KEY");

    const response = await fetch(`https://api.sora2api.ai/api/v1/sora2api/record-info?taskId=${taskId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${SORA_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Sora API error: ${response.status}`);
    }

    const data = await response.json();

    const successFlag = data.data?.successFlag;
    const isComplete = successFlag === 1 || successFlag === "1" || successFlag === true || successFlag === "true";

    return new Response(
      JSON.stringify({
        success: true,
        taskId: taskId,
        isComplete,
        videoUrl: data.data?.response || "",
        status: data.data?.status || "unknown",
        rawData: data.data,
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
