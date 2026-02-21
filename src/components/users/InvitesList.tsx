import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { revokeInvite, resendInvite, getInviteLink } from '@/services/userService';
import { Copy, RefreshCw, XCircle, Check } from 'lucide-react';
import type { Invite, InviteStatus } from '@/types/users';

interface InvitesListProps {
  invites: Invite[];
  loading: boolean;
  onRefresh: () => void;
}

export function InvitesList({ invites, loading, onRefresh }: InvitesListProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredInvites = invites.filter((invite) => {
    if (statusFilter === 'all') return true;
    return invite.status === statusFilter;
  });

  const getStatusBadge = (status: InviteStatus) => {
    const styles: Record<InviteStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      pending: { variant: 'default', label: 'Pendente' },
      accepted: { variant: 'secondary', label: 'Aceito' },
      expired: { variant: 'outline', label: 'Expirado' },
      revoked: { variant: 'destructive', label: 'Revogado' },
    };
    const style = styles[status];
    return <Badge variant={style.variant}>{style.label}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return <Badge variant="default">Admin</Badge>;
    }
    return <Badge variant="secondary">Influenciador</Badge>;
  };

  const handleCopyLink = async (invite: Invite) => {
    const link = getInviteLink(invite.token);
    await navigator.clipboard.writeText(link);
    setCopiedId(invite.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({
      title: 'Link copiado',
      description: 'O link foi copiado para a área de transferência.',
    });
  };

  const handleRevoke = async (invite: Invite) => {
    try {
      await revokeInvite(invite.id);
      toast({
        title: 'Convite revogado',
        description: 'O convite foi cancelado com sucesso.',
      });
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Erro ao revogar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleResend = async (invite: Invite) => {
    try {
      await resendInvite(invite.id);
      toast({
        title: 'Convite reenviado',
        description: 'O convite foi renovado e está pendente novamente.',
      });
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Erro ao reenviar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Convites</h3>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filtrar status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="accepted">Aceitos</SelectItem>
              <SelectItem value="expired">Expirados</SelectItem>
              <SelectItem value="revoked">Revogados</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>E-mail / Link</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Expira em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvites.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum convite encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvites.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell className="font-medium">
                      {invite.email || (
                        <span className="text-muted-foreground italic">Link compartilhável</span>
                      )}
                    </TableCell>
                    <TableCell>{getRoleBadge(invite.role)}</TableCell>
                    <TableCell>{getStatusBadge(invite.status)}</TableCell>
                    <TableCell>{formatDate(invite.created_at)}</TableCell>
                    <TableCell>{formatDate(invite.expires_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {invite.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCopyLink(invite)}
                              title="Copiar link"
                            >
                              {copiedId === invite.id ? (
                                <Check className="h-4 w-4 text-primary" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRevoke(invite)}
                              title="Revogar convite"
                            >
                              <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                        {(invite.status === 'expired' || invite.status === 'revoked') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResend(invite)}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Reativar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
