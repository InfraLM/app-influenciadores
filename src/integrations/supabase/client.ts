// API Client - migrado do Supabase para backend próprio
import { api } from '@/lib/api';

// Re-export the API client as supabase for backward compatibility
export const supabase = api as any;