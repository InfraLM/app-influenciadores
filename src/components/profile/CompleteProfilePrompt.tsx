import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompleteProfilePromptProps {
  onComplete: () => void;
}

export function CompleteProfilePrompt({ onComplete }: CompleteProfilePromptProps) {
  return (
    <div className="stat-card flex flex-col items-center text-center py-12 gap-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-warning/20">
        <AlertTriangle className="h-7 w-7 text-warning" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Perfil Incompleto</h2>
        <p className="text-muted-foreground max-w-md">
          Não foi encontrado um perfil de influenciador vinculado à sua conta. Você precisa completar o cadastro para continuar.
        </p>
      </div>
      <Button onClick={onComplete}>Completar Cadastro</Button>
    </div>
  );
}
