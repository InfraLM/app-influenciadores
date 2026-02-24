import type { AppRole } from '@/types/users';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function getToken(): string {
  return localStorage.getItem('auth_token') || '';
}

export async function createUserDirect(data: {
  email: string;
  password: string;
  name: string;
  role: AppRole;
  influencerId?: string;
}) {
  const response = await fetch(`${API_URL}/auth/admin/create-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Erro ao criar usuário');
  return result;
}

export async function deleteUser(_userId: string) {
  throw new Error('Exclusão de usuário não implementada no backend');
}

export async function createInvite(data: {
  email?: string;
  name?: string;
  role: AppRole;
  influencerId?: string;
  expiresInDays?: number;
}) {
  const response = await fetch(`${API_URL}/auth/invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Erro ao criar convite');
  return result;
}

export async function revokeInvite(inviteId: string) {
  const response = await fetch(`${API_URL}/auth/invite/revoke`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ inviteId }),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Erro ao revogar convite');
  return result;
}

export async function resendInvite(inviteId: string, expiresInDays = 7) {
  // Revoke old, create new with same data - for now just revoke
  return revokeInvite(inviteId);
}

export async function validateInviteToken(token: string) {
  const response = await fetch(`${API_URL}/auth/invite/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Token inválido');
  return result.invite;
}

export async function acceptInvite(data: {
  token: string;
  password: string;
  name?: string;
}) {
  const response = await fetch(`${API_URL}/auth/invite/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Erro ao aceitar convite');
  return result;
}

export function getInviteLink(token: string) {
  return `${window.location.origin}/aceitar-convite?token=${token}`;
}
