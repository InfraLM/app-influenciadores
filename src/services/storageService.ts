const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function getToken(): string {
  return localStorage.getItem('auth_token') || '';
}

/**
 * Faz upload de um arquivo de comprovação para o Backblaze B2 via backend.
 * Retorna a URL pública do arquivo.
 */
export async function uploadProofFile(
  file: File,
  influencerId: string,
  monthYear: string,
  contentType: 'feed' | 'story',
  index?: number
): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'png';
  const suffix = index !== undefined ? `-${index}` : '';
  const fileName = `${influencerId}/${monthYear}/${contentType}${suffix}-${Date.now()}.${fileExt}`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', fileName);

  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getToken()}`,
      // Não definir Content-Type: o browser define automaticamente com o boundary correto
    },
    body: formData,
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Erro ao enviar arquivo');
  }

  return result.url as string;
}

/**
 * Faz upload de um documento (PDF, DOC, XLSX etc.) para o Backblaze B2 via backend.
 * Retorna a URL pública do arquivo.
 */
export async function uploadDocumentFile(
  file: File,
  title: string
): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'pdf';
  const safeName = title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 60);
  const fileName = `documents/${Date.now()}-${safeName}.${fileExt}`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', fileName);

  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: formData,
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Erro ao enviar documento');
  }

  return result.url as string;
}

/**
 * Faz upload de múltiplos arquivos e retorna array de URLs públicas.
 */
export async function uploadMultipleProofFiles(
  files: File[],
  influencerId: string,
  monthYear: string,
  contentType: 'feed' | 'story'
): Promise<string[]> {
  const urls: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const url = await uploadProofFile(files[i], influencerId, monthYear, contentType, i);
    urls.push(url);
  }

  return urls;
}

/**
 * Faz upload de uma foto de perfil (avatar) para o Backblaze B2 via backend.
 * Retorna a URL pública do arquivo.
 */
export async function uploadAvatarFile(
  file: File,
  userId: string
): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `avatars/${userId}/avatar-${Date.now()}.${ext}`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', fileName);

  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: formData,
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Erro ao enviar foto de perfil');
  }

  return result.url as string;
}
