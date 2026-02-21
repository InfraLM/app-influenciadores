import { useState } from 'react';
import { FileText, Plus, Filter, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContentForm } from '@/components/content/ContentForm';
import { ContentList } from '@/components/content/ContentList';
import { ContentDebugPanel } from '@/components/content/ContentDebugPanel';
import { useContents, ContentRecord } from '@/hooks/useContents';
import { useInfluencers } from '@/hooks/useInfluencers';

export default function Contents() {
  const { influencerId, isInfluencer, isAdmin } = useAuth();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
  );
  const [selectedInfluencer, setSelectedInfluencer] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentRecord | null>(null);
  const [isExtraContent, setIsExtraContent] = useState(false);

  // Fetch contents from database
  const { data: contents = [], isLoading } = useContents(selectedMonth, selectedInfluencer);
  
  // Fetch influencers for admin filter
  const { influencers = [], loading: influencersLoading } = useInfluencers();

  // Generate month options (last 12 months)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    return {
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
    };
  });

  const regularContents = contents.filter((c) => !c.is_extra);
  const extraContents = contents.filter((c) => c.is_extra);

  const handleAddContent = (isExtra: boolean) => {
    setIsExtraContent(isExtra);
    setEditingContent(null);
    setIsFormOpen(true);
  };

  const handleEditContent = (content: ContentRecord) => {
    setEditingContent(content);
    setIsExtraContent(content.is_extra);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingContent(null);
    setIsExtraContent(false);
  };

  // Influencer with no linked profile
  const influencerNotLinked = isInfluencer && !influencerId;

  // Influencer View
  if (isInfluencer) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title flex items-center gap-2">
            <FileText className="h-7 w-7 text-primary" />
            Conteúdos do Mês
          </h1>
          <p className="page-description">
            Registre e gerencie seus conteúdos mensais com comprovação
          </p>
        </div>

        {/* Debug panel (admin only) */}
        <ContentDebugPanel selectedMonth={selectedMonth} />

        {/* Alert: influencer not linked */}
        {influencerNotLinked && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Perfil não vinculado</AlertTitle>
            <AlertDescription>
              Seu usuário ainda não está vinculado a um perfil de influenciador.
              Contate o administrador da Liberdade Médica para resolver.
            </AlertDescription>
          </Alert>
        )}

        {/* Month selector */}
        <div className="flex items-center gap-4">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Regular contents section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Conteúdos Obrigatórios</h2>
                <Button onClick={() => handleAddContent(false)} disabled={influencerNotLinked}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Conteúdo
                </Button>
              </div>
              <ContentList
                contents={regularContents}
                onEdit={handleEditContent}
                canEdit={true}
              />
            </div>

            {/* Extra contents section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Conteúdos Extras</h2>
                  <p className="text-sm text-muted-foreground">
                    Conteúdos adicionais além do obrigatório mensal
                  </p>
                </div>
                <Button variant="outline" onClick={() => handleAddContent(true)} disabled={influencerNotLinked}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Extra
                </Button>
              </div>
              <ContentList
                contents={extraContents}
                onEdit={handleEditContent}
                canEdit={true}
              />
            </div>
          </>
        )}

        {/* Form dialog */}
        <ContentForm
          open={isFormOpen}
          onClose={handleCloseForm}
          editingContent={editingContent}
          isExtra={isExtraContent}
          selectedMonth={selectedMonth}
          influencerId={influencerId || ''}
        />
      </div>
    );
  }

  // Admin/Team View (read-only)
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <FileText className="h-7 w-7 text-primary" />
          Conteúdos Registrados
        </h1>
        <p className="page-description">
          Visualize os conteúdos registrados pelos influenciadores
        </p>
      </div>
      {/* Debug panel (admin only) */}
      <ContentDebugPanel selectedMonth={selectedMonth} />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtros:</span>
        </div>
        
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Selecione o mês" />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedInfluencer} onValueChange={setSelectedInfluencer}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Influenciador" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os influenciadores</SelectItem>
            {influencers
              .filter((i) => i.status === 'active')
              .map((influencer) => (
                <SelectItem key={influencer.id} value={influencer.id}>
                  {influencer.full_name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {/* All contents (read-only) */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            {contents.length} conteúdo(s) encontrado(s)
          </h2>
          <ContentList
            contents={contents}
            canEdit={false}
            showInfluencerName={true}
          />
        </div>
      )}
    </div>
  );
}
