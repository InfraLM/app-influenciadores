import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { validateInviteToken, acceptInvite } from '@/services/userService';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertCircle, CheckCircle2, UserPlus } from 'lucide-react';

interface InviteData {
  id: string;
  email: string | null;
  name: string | null;
  role: 'admin' | 'influencer';
  influencer_id: string | null;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  expires_at: string;
}

type PageState = 'loading' | 'valid' | 'invalid' | 'success';

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const token = searchParams.get('token');

  const [pageState, setPageState] = useState<PageState>('loading');
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!token) {
      setError('Link de convite inválido. Verifique se o link está correto.');
      setPageState('invalid');
      return;
    }

    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const inviteData = await validateInviteToken(token!);
      
      if (!inviteData) {
        setError('Convite não encontrado. Verifique se o link está correto.');
        setPageState('invalid');
        return;
      }

      if (inviteData.status === 'accepted') {
        setError('Este convite já foi utilizado. Faça login com sua conta.');
        setPageState('invalid');
        return;
      }

      if (inviteData.status === 'expired') {
        setError('Este convite expirou. Solicite um novo convite ao administrador.');
        setPageState('invalid');
        return;
      }

      if (inviteData.status === 'revoked') {
        setError('Este convite foi cancelado. Entre em contato com o administrador.');
        setPageState('invalid');
        return;
      }

      if (new Date(inviteData.expires_at) < new Date()) {
        setError('Este convite expirou. Solicite um novo convite ao administrador.');
        setPageState('invalid');
        return;
      }

      setInvite(inviteData);
      setFormData((prev) => ({
        ...prev,
        name: inviteData.name || '',
      }));
      setPageState('valid');
    } catch (err: any) {
      setError(err.message || 'Erro ao validar convite');
      setPageState('invalid');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Informe seu nome para continuar.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: 'Senha inválida',
        description: 'A senha deve ter pelo menos 6 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Senhas não conferem',
        description: 'A confirmação de senha deve ser igual à senha.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      const result = await acceptInvite({
        token: token!,
        password: formData.password,
        name: formData.name,
      });

      setPageState('success');

      // Auto-login after successful account creation
      if (invite?.email) {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: invite.email,
          password: formData.password,
        });

        if (!loginError) {
          toast({
            title: 'Conta criada com sucesso!',
            description: 'Você será redirecionado para o dashboard.',
          });
          setTimeout(() => navigate('/'), 2000);
          return;
        }
      }

      toast({
        title: 'Conta criada com sucesso!',
        description: 'Faça login para acessar a plataforma.',
      });
    } catch (err: any) {
      toast({
        title: 'Erro ao criar conta',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (pageState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Validando convite...</p>
        </div>
      </div>
    );
  }

  if (pageState === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Convite Inválido</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild>
              <Link to="/login">Ir para Login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (pageState === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>Conta Criada!</CardTitle>
            <CardDescription>
              Sua conta foi criada com sucesso. Você será redirecionado em instantes...
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild>
              <Link to="/login">Ir para Login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <UserPlus className="h-10 w-10 text-primary mx-auto mb-4" />
          <CardTitle>Criar sua Conta</CardTitle>
          <CardDescription>
            Complete seu cadastro para acessar a plataforma
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {invite?.email && (
              <Alert>
                <AlertTitle>E-mail do convite</AlertTitle>
                <AlertDescription>{invite.email}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nome completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Seu nome completo"
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Digite a senha novamente"
                disabled={submitting}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar Conta'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
