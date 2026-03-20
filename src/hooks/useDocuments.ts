import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/integrations/supabase/client';

export interface DocumentRecord {
  id: string;
  title: string;
  description: string | null;
  category: 'briefing_institutional' | 'rules';
  file_url: string;
  uploaded_by_user_id: string;
  uploaded_by_name: string;
  created_at: string;
  updated_at: string;
}

export function useDocuments(categoryFilter?: string) {
  return useQuery({
    queryKey: ['documents', categoryFilter],
    queryFn: async () => {
      let query = api
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (categoryFilter && categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter as 'briefing_institutional' | 'rules');
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching documents:', error);
        throw error;
      }

      return (data || []) as DocumentRecord[];
    },
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (doc: {
      title: string;
      description?: string | null;
      category: 'briefing_institutional' | 'rules';
      file_url: string;
      uploaded_by_user_id: string;
      uploaded_by_name: string;
    }) => {
      const { data, error } = await api
        .from('documents')
        .insert(doc)
        .select()
        .single();

      if (error) {
        console.error('Error creating document:', error);
        throw new Error(error.message || error.error || 'Erro ao criar documento');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await api
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting document:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}
