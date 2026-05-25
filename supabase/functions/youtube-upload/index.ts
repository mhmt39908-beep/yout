import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { google } from "npm:googleapis@126";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface YouTubeUploadRequest {
  videoUrl: string;
  title: string;
  description: string;
  accessToken: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { videoUrl, title, description, accessToken }: YouTubeUploadRequest = await req.json();

    const videoResponse = await fetch(videoUrl);
    const videoBuffer = await videoResponse.arrayBuffer();

    const oauth2Client = new google.auth.OAuth2(
      Deno.env.get("GOOGLE_CLIENT_ID"),
      Deno.env.get("GOOGLE_CLIENT_SECRET")
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
    });

    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    });

    const uploadResponse = await youtube.videos.insert({
      requestBody: {
        snippet: {
          title: title,
          description: description,
          categoryId: "27",
        },
        status: {
          privacyStatus: "public",
          selfDeclaredMadeForKids: false,
        },
      },
      media: {
        mimeType: "video/mp4",
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(new Uint8Array(videoBuffer));
            controller.close();
          },
        }),
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        youtubeId: uploadResponse.data.id,
        youtubeUrl: `https://www.youtube.com/watch?v=${uploadResponse.data.id}`,
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
