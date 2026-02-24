import { useState, useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { api } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ProfileAvatarUploadProps {
  userId: string;
  currentUrl?: string | null;
  name: string;
  onUpload: (url: string) => void;
  disabled?: boolean;
}

export function ProfileAvatarUpload({
  userId,
  currentUrl,
  name,
  onUpload,
  disabled,
}: ProfileAvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const getInitials = (n: string) =>
    n
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Apenas JPG, PNG ou WEBP são aceitos');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5 MB');
      return;
    }

    setUploading(true);
    const ext = file.name.split('.').pop();
    const filePath = `${userId}/avatar.${ext}`;

    // Remove old avatar if exists
    await api.storage.from('influencer-avatars').remove([`${userId}/avatar.jpg`, `${userId}/avatar.png`, `${userId}/avatar.webp`]);

    const { error } = await api.storage
      .from('influencer-avatars')
      .upload(filePath, file, { upsert: true });

    if (error) {
      setUploading(false);
      toast.error('Erro ao fazer upload da imagem');
      console.error(error);
      return;
    }

    const { data: publicData } = api.storage
      .from('influencer-avatars')
      .getPublicUrl(filePath);

    const publicUrl = publicData?.publicUrl || '';

    setUploading(false);
    toast.success('Foto de perfil atualizada!');
    onUpload(publicUrl);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <Avatar className="h-28 w-28 ring-4 ring-primary/20">
          <AvatarImage src={currentUrl || undefined} alt={name} />
          <AvatarFallback className="text-xl bg-primary/10 text-primary">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        <Button
          type="button"
          size="icon"
          variant="secondary"
          disabled={disabled || uploading}
          className="absolute bottom-0 right-0 h-9 w-9 rounded-full border-2 border-background"
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      <p className="text-xs text-muted-foreground">JPG ou PNG até 5 MB</p>
    </div>
  );
}
