import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

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
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const GOOGLE_SHEETS_ID = Deno.env.get("GOOGLE_SHEETS_ID")!;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/Tablo1!A2:F100`
    );

    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.status}`);
    }

    const data = await response.json();
    const rows = data.values || [];

    const contents = rows
      .filter((row: string[]) => row.length >= 2 && row[0] && row[1])
      .map((row: string[]) => {
        const dateStr = row[0] || "";
        const title = row[1] || "Untitled";
        const description = row[2] || "";
        const format = row[3] || "short";
        let parsedDate = null;

        if (dateStr) {
          const trimmed = dateStr.trim();
          const parts = trimmed.split(" ");

          if (parts.length === 3) {
            const months: { [key: string]: number } = {
              "January": 0, "February": 1, "March": 2, "April": 3,
              "May": 4, "June": 5, "July": 6, "August": 7,
              "September": 8, "October": 9, "November": 10, "December": 11
            };

            const day = parseInt(parts[0], 10);
            const monthName = parts[1];
            const month = months[monthName];
            const year = parseInt(parts[2], 10);

            if (!isNaN(day) && month !== undefined && !isNaN(year)) {
              parsedDate = new Date(year, month, day);
            }
          }
        }

        return {
          date: parsedDate ? parsedDate.toISOString().split("T")[0] : dateStr,
          title,
          description,
          format,
          status: "pending",
        };
      });

    for (const content of contents) {
      const { data: existing } = await supabase
        .from("content_calendar")
        .select("id")
        .eq("date", content.date)
        .eq("title", content.title)
        .maybeSingle();

      if (!existing) {
        await supabase.from("content_calendar").insert(content);
      } else {
        await supabase
          .from("content_calendar")
          .update({
            description: content.description,
            format: content.format,
            status: content.status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        synced: contents.length,
        contents: contents,
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
