import { toast } from 'sonner';

/**
 * Normalizes a URL by ensuring it has a protocol prefix.
 * Returns null if the URL is empty, a relative path, or invalid.
 */
export function normalizeUrl(url: string | null | undefined): string | null {
  if (!url || url.trim() === '') return null;

  let normalized = url.trim();

  // Reject relative paths (not real external URLs)
  if (normalized.startsWith('/') && !normalized.startsWith('//')) {
    return null;
  }

  // Handle protocol-relative URLs
  if (normalized.startsWith('//')) {
    normalized = `https:${normalized}`;
  }

  // Add https:// if no protocol
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }

  try {
    const parsed = new URL(normalized);
    // Must have a valid hostname
    if (!parsed.hostname || parsed.hostname.length < 2) return null;
    // Return the manually-built string, NOT parsed.href,
    // to avoid URL re-encoding that alters the original link
    return normalized;
  } catch {
    return null;
  }
}

/**
 * Checks if a URL is an Instagram link.
 */
export function isInstagramUrl(url: string): boolean {
  const normalized = normalizeUrl(url);
  if (!normalized) return false;
  try {
    const parsed = new URL(normalized);
    return /instagram\.com$/i.test(parsed.hostname) || /instagr\.am$/i.test(parsed.hostname);
  } catch {
    return false;
  }
}

/**
 * Checks if a URL looks like an Instagram Story (which may expire).
 */
export function isInstagramStory(url: string): boolean {
  const normalized = normalizeUrl(url);
  if (!normalized) return false;
  return /instagram\.com\/stories\//i.test(normalized);
}

/**
 * Copies a URL to clipboard with toast feedback.
 */
export function copyLinkToClipboard(url: string | null | undefined): void {
  const normalized = normalizeUrl(url);

  if (!normalized) {
    toast.error('Nenhum link para copiar.');
    return;
  }

  navigator.clipboard.writeText(normalized).then(() => {
    toast.success('Link copiado!');
  }).catch(() => {
    toast.error('Não foi possível copiar o link.');
  });
}
