import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface WorkRequest {
  contentId: string;
}

async function checkSoraStatus(taskId: string, soraApiKey: string) {
  const response = await fetch(
    `https://api.sora2api.ai/api/v1/sora2api/record-info?taskId=${taskId}`,
    {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${soraApiKey}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Sora API error: ${response.status}`);
  }

  const data = await response.json();
  const successFlag = data.data?.successFlag;
  const isComplete = successFlag === 1 || successFlag === "1" || successFlag === true;

  return {
    isComplete,
    videoUrl: data.data?.response || "",
    status: data.data?.status || "unknown",
  };
}

async function processVideo(contentId: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const soraApiKey = Deno.env.get("SORA_API_KEY");

  if (!supabaseUrl || !supabaseKey || !soraApiKey) {
    throw new Error("Missing environment variables");
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: content, error: fetchError } = await supabase
    .from("content_calendar")
    .select("*")
    .eq("id", contentId)
    .maybeSingle();

  if (fetchError || !content) {
    throw new Error(`Failed to fetch content: ${fetchError?.message}`);
  }

  if (!content.task_id) {
    throw new Error("No task_id found");
  }

  const maxAttempts = 120;
  const pollInterval = 5000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const statusResult = await checkSoraStatus(content.task_id, soraApiKey);

      if (statusResult.isComplete && statusResult.videoUrl) {
        await supabase
          .from("content_calendar")
          .update({
            video_url: statusResult.videoUrl,
            status: "video_ready",
            updated_at: new Date().toISOString(),
          })
          .eq("id", contentId);

        return {
          success: true,
          message: "Video ready",
          videoUrl: statusResult.videoUrl,
        };
      }

      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
      }
    } catch (pollError) {
      console.error(`Poll attempt ${attempt} failed:`, pollError);
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
      }
    }
  }

  await supabase
    .from("content_calendar")
    .update({
      status: "failed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", contentId);

  throw new Error("Video generation timed out");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { contentId }: WorkRequest = await req.json();

    if (!contentId) {
      throw new Error("contentId is required");
    }

    const result = await processVideo(contentId);

    return new Response(JSON.stringify(result), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
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
