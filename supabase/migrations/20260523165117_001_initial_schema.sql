/*
  # Video Production System Schema

  1. New Tables
    - `content_calendar`: Stores scheduled content from Google Sheets
      - `id` (uuid, primary key)
      - `date` (date): Scheduled date for content
      - `title` (text): Content title
      - `description` (text): Content description/prompt
      - `format` (text): Content format (short, long, etc.)
      - `status` (text): Current status (pending, processing, completed, failed)
      - `video_url` (text): Generated video URL
      - `youtube_id` (text): YouTube video ID after upload
      - `task_id` (text): Sora API task ID
      - `attempts` (integer): Number of generation attempts
      - `created_at` (timestamp): Record creation time
      - `updated_at` (timestamp): Last update time
    
    - `api_credentials`: Stores encrypted API credentials (admin use only)
      - `id` (uuid, primary key)
      - `service_name` (text): Name of the service (sora, google, youtube)
      - `credentials` (jsonb): Encrypted credential data
      - `created_at` (timestamp): Record creation time
      - `updated_at` (timestamp): Last update time

  2. Security
    - Enable RLS on all tables
    - Public read access for content_calendar (for demo)
    - Service role only for credentials
*/

CREATE TABLE IF NOT EXISTS content_calendar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  title text NOT NULL,
  description text,
  format text DEFAULT 'short',
  status text DEFAULT 'pending',
  video_url text,
  youtube_id text,
  task_id text,
  attempts integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS api_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name text UNIQUE NOT NULL,
  credentials jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_calendar_date ON content_calendar(date);
CREATE INDEX IF NOT EXISTS idx_content_calendar_status ON content_calendar(status);

ALTER TABLE content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access content calendar"
  ON content_calendar FOR SELECT
  USING (true);

CREATE POLICY "Public insert access content calendar"
  ON content_calendar FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update access content calendar"
  ON content_calendar FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role manages credentials"
  ON api_credentials FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
