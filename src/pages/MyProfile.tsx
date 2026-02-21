import { useState } from 'react';
import { User, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInfluencerProfile } from '@/hooks/useInfluencerProfile';
import { InfluencerProfileForm } from '@/components/profile/InfluencerProfileForm';
import { CreateInfluencerProfileForm } from '@/components/profile/CreateInfluencerProfileForm';
import { PartnershipReadOnly } from '@/components/profile/PartnershipReadOnly';

export default function MyProfile() {
  const { user } = useAuth();
  const { influencer, loading, refetch } = useInfluencerProfile(user?.id);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSaved = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleCreated = () => {
    // Refetch the influencer profile after creation
    refetch();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If no influencer profile is linked, show create form
  if (!influencer) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title flex items-center gap-2">
            <User className="h-7 w-7 text-primary" />
            Completar Meu Perfil
          </h1>
          <p className="page-description">
            Preencha seus dados para completar seu cadastro como influenciador
          </p>
        </div>
        <CreateInfluencerProfileForm onCreated={handleCreated} />
      </div>
    );
  }

  return (
    <div className="space-y-6" key={refreshKey}>
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <User className="h-7 w-7 text-primary" />
          Meu Perfil
        </h1>
        <p className="page-description">Gerencie seus dados e registre seus conteúdos</p>
      </div>

      <Tabs defaultValue="dados" className="space-y-6">
        <TabsList>
          <TabsTrigger value="dados">Meus Dados</TabsTrigger>
          <TabsTrigger value="parceria">Dados da Parceria</TabsTrigger>
        </TabsList>

        <TabsContent value="dados">
          <InfluencerProfileForm
            influencer={influencer}
            userId={user?.id || ''}
            onSaved={handleSaved}
          />
        </TabsContent>

        <TabsContent value="parceria">
          <PartnershipReadOnly influencer={influencer} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
