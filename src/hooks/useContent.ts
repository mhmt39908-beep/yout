import { useState, useEffect } from 'react';
import { supabase, ContentItem } from '../lib/supabase';

export function useContent() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('content_calendar')
        .select('*')
        .order('date', { ascending: true });

      if (fetchError) throw fetchError;
      setContent(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch content');
    } finally {
      setLoading(false);
    }
  };

  const updateContent = async (id: string, updates: Partial<ContentItem>) => {
    const { error: updateError } = await supabase
      .from('content_calendar')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (updateError) throw updateError;
    await fetchContent();
  };

  useEffect(() => {
    fetchContent();
  }, []);

  return { content, loading, error, refetch: fetchContent, updateContent };
}
