import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserCog } from 'lucide-react';
import type { AppRole, UserStatus, UserWithRole } from '@/types/users';

interface UsersTableProps {
  users: UserWithRole[];
  loading: boolean;
  onEditUser: (user: UserWithRole) => void;
  onToggleStatus: (user: UserWithRole) => void;
}

export function UsersTable({ users, loading, onEditUser, onToggleStatus }: UsersTableProps) {
  const getRoleBadge = (role?: AppRole) => {
    if (role === 'admin') {
      return <Badge variant="default">Administrador</Badge>;
    }
    return <Badge variant="secondary">Influenciador</Badge>;
  };

  const getStatusBadge = (status: UserStatus) => {
    if (status === 'active') {
      return <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Ativo</Badge>;
    }
    return <Badge variant="outline" className="text-muted-foreground">Inativo</Badge>;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Perfil</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                Nenhum usuário encontrado
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                <TableCell>{getStatusBadge(user.status)}</TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditUser(user)}
                    >
                      <UserCog className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant={user.status === 'active' ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => onToggleStatus(user)}
                    >
                      {user.status === 'active' ? 'Desativar' : 'Ativar'}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
