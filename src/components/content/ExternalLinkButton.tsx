import { ExternalLink, Copy, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { toast } from 'sonner';

interface ExternalLinkButtonProps {
  url: string | null | undefined;
  label?: string;
  showCopyButton?: boolean;
  className?: string;
}

/**
 * Safe external link component that uses raw URLs without any transformation.
 * CRITICAL: The URL is used exactly as saved — no encoding, decoding,
 * normalization, or parsing via new URL(). This preserves complex
 * query parameters (Instagram, UTM, etc.) exactly as the user entered them.
 */
export function ExternalLinkButton({
  url,
  label,
  showCopyButton = true,
  className = '',
}: ExternalLinkButtonProps) {
  // Use the raw string — no normalizeUrl, no new URL(), no encoding
  const rawUrl = url?.trim() || '';

  if (!rawUrl) {
    return (
      <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        Link não informado
      </span>
    );
  }

  // Simple protocol check without URL parsing
  const hasProtocol = /^https?:\/\//i.test(rawUrl);
  const href = hasProtocol ? rawUrl : `https://${rawUrl}`;

  const isInsta = /instagram\.com/i.test(rawUrl) || /instagr\.am/i.test(rawUrl);
  const isStory = /instagram\.com\/stories\//i.test(rawUrl);
  const displayLabel = label || (isInsta ? 'Abrir no Instagram' : 'Abrir link');

  const handleCopy = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(rawUrl).then(() => {
        toast.success('Link copiado!');
      }).catch(() => {
        fallbackCopy();
      });
    } else {
      fallbackCopy();
    }
  };

  const fallbackCopy = () => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = rawUrl;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      toast.success('Link copiado!');
    } catch {
      toast.error('Não foi possível copiar. Copie manualmente o link.');
    }
  };

  return (
    <TooltipProvider>
      <div className={`inline-flex items-center gap-1.5 flex-wrap ${className}`}>
        {/* Open link — real <a> tag, raw href, always new tab */}
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-info hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              {displayLabel}
            </a>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">
              {isStory
                ? 'Link de Story — pode expirar após 24h'
                : 'Abre em nova aba'}
            </p>
          </TooltipContent>
        </Tooltip>

        {/* Copy link button */}
        {showCopyButton && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleCopy}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Copiar link</p>
            </TooltipContent>
          </Tooltip>
        )}

        {isStory && (
          <span className="inline-flex items-center gap-1 text-xs text-warning">
            <Info className="h-3 w-3" />
            Pode expirar
          </span>
        )}
      </div>
    </TooltipProvider>
  );
}
