import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Mail, Link, RefreshCw } from 'lucide-react';

import { UsersTable } from '@/components/users/UsersTable';
import { InvitesList } from '@/components/users/InvitesList';
import { AddUserDialog } from '@/components/users/AddUserDialog';
import { EditUserDialog } from '@/components/users/EditUserDialog';
import { InviteUserDialog } from '@/components/users/InviteUserDialog';
import { GenerateLinkDialog } from '@/components/users/GenerateLinkDialog';

import type { UserWithRole, Invite, UserStatus } from '@/types/users';

export default function Users() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingInvites, setLoadingInvites] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Dialog states
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [inviteUserOpen, setInviteUserOpen] = useState(false);
  const [generateLinkOpen, setGenerateLinkOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);

  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.user_id);
        return {
          ...profile,
          role: userRole?.role,
        };
      });

      setUsers(usersWithRoles);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar usuários',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchInvites = async () => {
    setLoadingInvites(true);
    try {
      const { data, error } = await supabase
        .from('invites')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvites((data || []) as Invite[]);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar convites',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoadingInvites(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchInvites();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const toggleUserStatus = async (user: UserWithRole) => {
    const newStatus: UserStatus = user.status === 'active' ? 'inactive' : 'active';

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: newStatus === 'active' ? 'Usuário ativado' : 'Usuário desativado',
        description: `${user.name} foi ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso.`,
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Erro ao alterar status',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie usuários e convites da plataforma
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setGenerateLinkOpen(true)}>
            <Link className="h-4 w-4 mr-2" />
            Gerar Link
          </Button>
          <Button variant="outline" onClick={() => setInviteUserOpen(true)}>
            <Mail className="h-4 w-4 mr-2" />
            Convidar
          </Button>
          <Button onClick={() => setAddUserOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Usuário
          </Button>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Usuários ({users.length})</TabsTrigger>
          <TabsTrigger value="invites">Convites ({invites.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Usuários</CardTitle>
              <CardDescription>
                {filteredUsers.length} usuário(s) encontrado(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou e-mail..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filtrar por perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os perfis</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="influencer">Influenciador</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={fetchUsers}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              <UsersTable
                users={filteredUsers}
                loading={loadingUsers}
                onEditUser={setEditingUser}
                onToggleStatus={toggleUserStatus}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invites">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Convites</CardTitle>
              <CardDescription>
                Acompanhe e gerencie convites enviados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvitesList
                invites={invites}
                loading={loadingInvites}
                onRefresh={fetchInvites}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AddUserDialog
        open={addUserOpen}
        onOpenChange={setAddUserOpen}
        onSuccess={fetchUsers}
      />

      <InviteUserDialog
        open={inviteUserOpen}
        onOpenChange={setInviteUserOpen}
        onSuccess={fetchInvites}
      />

      <GenerateLinkDialog
        open={generateLinkOpen}
        onOpenChange={setGenerateLinkOpen}
        onSuccess={fetchInvites}
      />

      <EditUserDialog
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
        user={editingUser}
        onSuccess={fetchUsers}
      />
    </div>
  );
}
