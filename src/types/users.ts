import type { Database } from '@/integrations/supabase/types';

export type AppRole = Database['public']['Enums']['app_role'];
export type UserStatus = Database['public']['Enums']['user_status'];
export type InviteStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface UserWithRole extends Profile {
  role?: AppRole;
}

export interface Invite {
  id: string;
  token: string;
  email: string | null;
  name: string | null;
  role: AppRole;
  influencer_id: string | null;
  status: InviteStatus;
  created_by: string;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
  accepted_by: string | null;
}

export interface Influencer {
  id: string;
  full_name: string;
  email: string;
  user_id: string | null;
}
