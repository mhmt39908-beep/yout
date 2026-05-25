const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
};

export async function syncFromSheets() {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/sheets-sync`, {
    method: 'POST',
    headers,
  });
  return response.json();
}

export async function generateVideo(prompt: string, aspectRatio = 'portrait', quality = 'hd') {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/sora-generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ prompt, aspectRatio, quality }),
  });
  return response.json();
}

export async function checkVideoStatus(taskId: string) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/sora-status?taskId=${taskId}`, {
    method: 'GET',
    headers,
  });
  return response.json();
}

export async function uploadToYouTube(
  videoUrl: string,
  title: string,
  description: string,
  accessToken: string
) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/youtube-upload`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ videoUrl, title, description, accessToken }),
  });
  return response.json();
}
