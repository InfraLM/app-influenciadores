import { api } from '@/integrations/supabase/client';
import type { AppRole, Invite } from '@/types/users';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export async function createUserDirect(data: {
  email: string;
  password: string;
  name: string;
  role: AppRole;
  influencerId?: string;
}) {
  const session = await api.auth.getSession();
  const token = session.data.session?.access_token;

  const response = await fetch(`${SUPABASE_URL}/functions/v1/manage-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      action: 'create',
      ...data,
    }),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.error);
  return result;
}

export async function deleteUser(userId: string) {
  const session = await api.auth.getSession();
  const token = session.data.session?.access_token;

  const response = await fetch(`${SUPABASE_URL}/functions/v1/manage-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      action: 'delete',
      userId,
    }),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.error);
  return result;
}

export async function createInvite(data: {
  email?: string;
  name?: string;
  role: AppRole;
  influencerId?: string;
  expiresInDays?: number;
}) {
  const session = await api.auth.getSession();
  const token = session.data.session?.access_token;

  const response = await fetch(`${SUPABASE_URL}/functions/v1/manage-invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      action: 'create',
      ...data,
    }),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.error);
  return result;
}

export async function revokeInvite(inviteId: string) {
  const session = await api.auth.getSession();
  const token = session.data.session?.access_token;

  const response = await fetch(`${SUPABASE_URL}/functions/v1/manage-invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      action: 'revoke',
      inviteId,
    }),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.error);
  return result;
}

export async function resendInvite(inviteId: string, expiresInDays = 7) {
  const session = await api.auth.getSession();
  const token = session.data.session?.access_token;

  const response = await fetch(`${SUPABASE_URL}/functions/v1/manage-invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      action: 'resend',
      inviteId,
      expiresInDays,
    }),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.error);
  return result;
}

export async function validateInviteToken(token: string) {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

  const response = await fetch(`${SUPABASE_URL}/functions/v1/manage-invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'validate',
      token,
    }),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.error);
  return result.invite;
}

export async function acceptInvite(data: {
  token: string;
  password: string;
  name?: string;
}) {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

  const response = await fetch(`${SUPABASE_URL}/functions/v1/manage-invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'accept',
      ...data,
    }),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.error);
  return result;
}

export function getInviteLink(token: string) {
  return `${window.location.origin}/aceitar-convite?token=${token}`;
}
