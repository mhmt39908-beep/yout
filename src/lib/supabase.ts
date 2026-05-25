import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type ContentItem = {
  id: string;
  date: string;
  title: string;
  description: string | null;
  format: string;
  status: string;
  video_url: string | null;
  youtube_id: string | null;
  task_id: string | null;
  attempts: number;
  created_at: string;
  updated_at: string;
};
