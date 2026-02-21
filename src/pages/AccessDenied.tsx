import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldX } from 'lucide-react';

export default function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <ShieldX className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Acesso Negado</CardTitle>
          <CardDescription>
            Você não tem permissão para acessar esta página.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Se você acredita que deveria ter acesso, entre em contato com o administrador do sistema.
          </p>
        </CardContent>
        <CardFooter className="justify-center">
          <Button asChild>
            <Link to="/">Voltar ao início</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
