import { useState, useCallback } from 'react';
import { generateVideo, checkVideoStatus } from '../lib/api';
import { supabase, ContentItem } from '../lib/supabase';

const MAX_RETRIES = 20;
const POLL_INTERVAL = 30000;

export function useVideoGeneration() {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<string>('');

  const generateAndPoll = useCallback(async (item: ContentItem): Promise<boolean> => {
    try {
      setProcessing(true);
      setProgress('Starting video generation...');

      await supabase
        .from('content_calendar')
        .update({ status: 'processing', attempts: 0, updated_at: new Date().toISOString() })
        .eq('id', item.id);

      const genResult = await generateVideo(item.description || item.title);

      if (!genResult.success) {
        throw new Error(genResult.error || 'Failed to start generation');
      }

      const taskId = genResult.taskId;

      await supabase
        .from('content_calendar')
        .update({ task_id: taskId, updated_at: new Date().toISOString() })
        .eq('id', item.id);

      setProgress('Video generation started. Polling for completion...');

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        setProgress(`Checking video status (${attempt}/${MAX_RETRIES})...`);

        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));

        const statusResult = await checkVideoStatus(taskId);

        if (statusResult.isComplete && statusResult.videoUrl) {
          await supabase
            .from('content_calendar')
            .update({
              video_url: statusResult.videoUrl,
              status: 'video_ready',
              updated_at: new Date().toISOString()
            })
            .eq('id', item.id);

          setProgress('Video generated successfully!');
          return true;
        }
      }

      throw new Error('Video generation timed out');

    } catch (error) {
      await supabase
        .from('content_calendar')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('id', item.id);

      setProgress(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    } finally {
      setProcessing(false);
    }
  }, []);

  return { generateAndPoll, processing, progress };
}
