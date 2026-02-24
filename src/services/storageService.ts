import { api } from '@/integrations/supabase/client';

/**
 * Uploads a proof file to the content-proofs storage bucket.
 * Returns the public URL of the uploaded file.
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

  const { error: uploadError } = await api.storage
    .from('content-proofs')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    console.error('Error uploading proof file:', uploadError);
    throw new Error(`Erro ao enviar comprovação: ${uploadError.message}`);
  }

  const { data: urlData } = api.storage
    .from('content-proofs')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

/**
 * Uploads multiple proof files and returns an array of public URLs.
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
