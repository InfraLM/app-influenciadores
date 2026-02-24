import { useState, useEffect, useMemo } from 'react';
import { ClipboardCheck, Save, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { useInfluencers } from '@/hooks/useInfluencers';
import { useInfluencerEvaluation, useUpsertEvaluation } from '@/hooks/usePerformanceEvaluations';
import { useContents } from '@/hooks/useContents';

// Quality checklist items (each worth 0.5 points, max 3 points)
const qualityChecklistItems = [
  { id: 'clarity', label: 'Clareza na explicação' },
  { id: 'storytelling', label: 'Storytelling ou raciocínio bem estruturado' },
  { id: 'audiovisual', label: 'Qualidade visual e de áudio' },
  { id: 'alignment', label: 'Alinhamento com a Formação Paciente Grave' },
  { id: 'language', label: 'Linguagem médica responsável' },
  { id: 'practical', label: 'Conteúdo gera aprendizado prático' },
];

// Bonus items
const bonusItems = [
  { id: 'extra_stories', label: 'Stories explicativos adicionais', value: 0.5 },
  { id: 'interaction_prints', label: 'Prints de dúvidas/interação nos stories', value: 0.5 },
  { id: 'other_network', label: 'Conteúdo em outra rede social', value: 1 },
  { id: 'extra_reels', label: 'Reels extras além do obrigatório', value: 1 },
];

export default function PerformanceEvaluation() {
  const currentDate = new Date();
  
  const [selectedMonth, setSelectedMonth] = useState(
    `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
  );
  const [selectedInfluencer, setSelectedInfluencer] = useState<string>('');
  
  // Quality checklist state
  const [qualityChecklist, setQualityChecklist] = useState<Record<string, boolean>>({});
  
  // Sales
  const [salesCount, setSalesCount] = useState<number>(0);
  
  // Engagement
  const [engagementScore, setEngagementScore] = useState<string>('0');
  
  // Partner posture
  const [postureScore, setPostureScore] = useState<string>('1');
  
  // Bonus items state
  const [bonusChecklist, setBonusChecklist] = useState<Record<string, boolean>>({});
  
  // Leads and sales (internal)
  const [leadsCount, setLeadsCount] = useState<number>(0);
  const [qualitativeNotes, setQualitativeNotes] = useState<string>('');

  // Fetch real influencers from database
  const { influencers, loading: loadingInfluencers } = useInfluencers();
  
  // Fetch evaluation for selected influencer/month
  const { data: existingEvaluation, isLoading: loadingEvaluation } = useInfluencerEvaluation(
    selectedInfluencer,
    selectedMonth
  );
  
  // Fetch contents for engagement calculation
  const { data: contents = [] } = useContents(selectedMonth, selectedInfluencer);
  
  // Mutation for saving
  const upsertEvaluation = useUpsertEvaluation();

  // Generate month options (last 12 months)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    return {
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
    };
  });

  // Active influencers only
  const activeInfluencers = influencers.filter((i) => i.status === 'active');

  // Calculate engagement rate from registered contents
  const calculatedEngagementRate = useMemo(() => {
    if (contents.length === 0) return null;
    
    const totalReach = contents.reduce((sum, c) => sum + c.reach, 0);
    const totalInteractions = contents.reduce((sum, c) => sum + c.interactions, 0);
    
    if (totalReach === 0) return 0;
    
    return ((totalInteractions / totalReach) * 100).toFixed(2);
  }, [contents]);

  // Load existing evaluation data when influencer/month changes
  useEffect(() => {
    if (existingEvaluation) {
      // Load quality checklist
      setQualityChecklist(existingEvaluation.quality_checklist || {});
      
      // Load sales count
      setSalesCount(existingEvaluation.sales || 0);
      
      // Load engagement score
      setEngagementScore(String(existingEvaluation.engagement_score));
      
      // Load posture score
      setPostureScore(String(existingEvaluation.partner_posture_score));
      
      // Load bonus checklist
      setBonusChecklist(existingEvaluation.bonus_checklist || {});
      
      // Load leads and notes
      setLeadsCount(existingEvaluation.leads || 0);
      setQualitativeNotes(existingEvaluation.qualitative_notes || '');
    } else {
      // Reset form for new evaluation
      setQualityChecklist({});
      setSalesCount(0);
      setEngagementScore('0');
      setPostureScore('1');
      setBonusChecklist({});
      setLeadsCount(0);
      setQualitativeNotes('');
    }
  }, [existingEvaluation]);

  // Calculate quality score from checklist (max 3 points)
  const qualityScore = useMemo(() => {
    const checkedCount = Object.values(qualityChecklist).filter(Boolean).length;
    return Math.min(checkedCount * 0.5, 3);
  }, [qualityChecklist]);

  // Calculate sales score (max 4 points)
  const salesScore = useMemo(() => {
    return Math.min(salesCount, 4);
  }, [salesCount]);

  // Calculate bonus score (max 3 points)
  const bonusScore = useMemo(() => {
    let total = 0;
    bonusItems.forEach((item) => {
      if (bonusChecklist[item.id]) {
        total += item.value;
      }
    });
    return Math.min(total, 3);
  }, [bonusChecklist]);

  // Calculate total score
  const totalScore = useMemo(() => {
    return qualityScore + salesScore + parseFloat(engagementScore) + parseFloat(postureScore) + bonusScore;
  }, [qualityScore, salesScore, engagementScore, postureScore, bonusScore]);

  const handleSave = async () => {
    if (!selectedInfluencer || !selectedMonth) {
      toast.error('Selecione um influenciador e um mês');
      return;
    }

    try {
      await upsertEvaluation.mutateAsync({
        influencer_id: selectedInfluencer,
        month_year: selectedMonth,
        content_quality_score: qualityScore,
        sales_score: salesScore,
        engagement_score: parseFloat(engagementScore),
        partner_posture_score: parseFloat(postureScore),
        bonus_score: bonusScore,
        total_score: totalScore,
        leads: leadsCount,
        sales: salesCount,
        qualitative_notes: qualitativeNotes || null,
        quality_checklist: qualityChecklist,
        bonus_checklist: bonusChecklist,
      });

      toast.success('Avaliação salva com sucesso!');
    } catch (error) {
      console.error('Error saving performance:', error);
      toast.error('Erro ao salvar avaliação');
    }
  };

  const selectedInfluencerData = influencers.find((i) => i.id === selectedInfluencer);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <ClipboardCheck className="h-7 w-7 text-primary" />
          Avaliação de Performance
        </h1>
        <p className="page-description">
          Edite manualmente a performance e o ranking dos influenciadores
        </p>
      </div>

      {/* Selectors */}
      <div className="stat-card">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Label>Mês/Ano</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="mt-1">
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
          <div className="flex-1 min-w-[200px]">
            <Label>Influenciador</Label>
            {loadingInfluencers ? (
              <div className="flex items-center justify-center h-10 mt-1">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Select value={selectedInfluencer} onValueChange={setSelectedInfluencer}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o influenciador" />
                </SelectTrigger>
                <SelectContent>
                  {activeInfluencers.map((influencer) => (
                    <SelectItem key={influencer.id} value={influencer.id}>
                      {influencer.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>

      {/* Influencer info card */}
      {selectedInfluencerData && (
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={selectedInfluencerData.profile_photo_url || undefined} />
              <AvatarFallback>
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{selectedInfluencerData.full_name}</h3>
              {selectedInfluencerData.instagram && (
                <p className="text-muted-foreground">{selectedInfluencerData.instagram}</p>
              )}
            </div>
            {loadingEvaluation && (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground ml-auto" />
            )}
          </div>
        </div>
      )}

      {selectedInfluencer && selectedMonth && !loadingEvaluation && (
        <>
          {/* Quality Score Section */}
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Qualidade do Conteúdo</h3>
              <span className="text-lg font-bold text-primary">{qualityScore}/3 pts</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Cada item vale 0,5 ponto. Máximo de 3 pontos.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {qualityChecklistItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={item.id}
                    checked={qualityChecklist[item.id] || false}
                    onCheckedChange={(checked) =>
                      setQualityChecklist({ ...qualityChecklist, [item.id]: !!checked })
                    }
                  />
                  <label
                    htmlFor={item.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {item.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Sales Score Section */}
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Vendas por Cupom</h3>
              <span className="text-lg font-bold text-primary">{salesScore}/4 pts</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              0 vendas = 0pts | 1 = 1pt | 2 = 2pts | 3 = 3pts | 4+ = 4pts (teto)
            </p>
            <div className="max-w-[200px]">
              <Label>Quantidade de vendas no mês</Label>
              <Input
                type="number"
                min="0"
                value={salesCount}
                onChange={(e) => setSalesCount(parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Engagement Score Section */}
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Engajamento Proporcional</h3>
              <span className="text-lg font-bold text-primary">{engagementScore}/2 pts</span>
            </div>
            {calculatedEngagementRate !== null ? (
              <p className="text-sm text-muted-foreground mb-4">
                Taxa calculada dos conteúdos registrados: <strong>{calculatedEngagementRate}%</strong>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground mb-4">
                Nenhum conteúdo registrado para calcular taxa de engajamento.
              </p>
            )}
            <RadioGroup value={engagementScore} onValueChange={setEngagementScore}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="0" id="eng-0" />
                <label htmlFor="eng-0" className="text-sm">&lt;1% → 0 pontos</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="eng-1" />
                <label htmlFor="eng-1" className="text-sm">1% a 2,9% → 1 ponto</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1.5" id="eng-1.5" />
                <label htmlFor="eng-1.5" className="text-sm">3% a 4,9% → 1,5 pontos</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="eng-2" />
                <label htmlFor="eng-2" className="text-sm">≥5% → 2 pontos</label>
              </div>
            </RadioGroup>
          </div>

          {/* Partner Posture Section */}
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Postura de Parceiro</h3>
              <span className="text-lg font-bold text-primary">{postureScore}/1 pt</span>
            </div>
            <RadioGroup value={postureScore} onValueChange={setPostureScore}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="posture-1" />
                <label htmlFor="posture-1" className="text-sm">
                  1 ponto — Comunicação adequada e cumprimento de prazos
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="0" id="posture-0" />
                <label htmlFor="posture-0" className="text-sm">
                  0 pontos — Desalinhamento, atrasos ou falhas de comunicação
                </label>
              </div>
            </RadioGroup>
          </div>

          {/* Bonus Section */}
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Pontuação Extra (Bônus)</h3>
              <span className="text-lg font-bold text-primary">+{bonusScore}/3 pts</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Máximo de +3 pontos de bônus.
            </p>
            <div className="space-y-3">
              {bonusItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={item.id}
                    checked={bonusChecklist[item.id] || false}
                    onCheckedChange={(checked) =>
                      setBonusChecklist({ ...bonusChecklist, [item.id]: !!checked })
                    }
                  />
                  <label
                    htmlFor={item.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {item.label} (+{item.value} pt{item.value > 1 ? 's' : ''})
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Total Score */}
          <div className="stat-card bg-primary/10 border-primary/30">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Pontuação Total</h3>
              <span className="text-3xl font-bold text-primary">{totalScore} pts</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Qualidade ({qualityScore}) + Vendas ({salesScore}) + Engajamento ({engagementScore}) + Postura ({postureScore}) + Bônus ({bonusScore})
            </p>
          </div>

          {/* Internal Data Section */}
          <div className="stat-card border-dashed">
            <h3 className="font-semibold mb-4">Dados Internos (não visível para influenciadores)</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Leads gerados no mês</Label>
                <Input
                  type="number"
                  min="0"
                  value={leadsCount}
                  onChange={(e) => setLeadsCount(parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Vendas geradas no mês</Label>
                <Input
                  type="number"
                  min="0"
                  value={salesCount}
                  onChange={(e) => setSalesCount(parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="mt-4">
              <Label>Observações qualitativas</Label>
              <Textarea
                value={qualitativeNotes}
                onChange={(e) => setQualitativeNotes(e.target.value)}
                placeholder="Pontos fortes, áreas de melhoria, observações gerais..."
                className="mt-1"
                rows={4}
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={upsertEvaluation.isPending}
              size="lg"
            >
              {upsertEvaluation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Salvar Avaliação
            </Button>
          </div>
        </>
      )}

      {/* Empty state when no influencer selected */}
      {!selectedInfluencer && !loadingInfluencers && (
        <div className="stat-card text-center py-12">
          <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Selecione um influenciador para iniciar a avaliação
          </p>
        </div>
      )}

      {/* Empty state when no active influencers */}
      {!loadingInfluencers && activeInfluencers.length === 0 && (
        <div className="stat-card text-center py-12">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Nenhum influenciador ativo cadastrado. Cadastre influenciadores na aba "Influenciadores".
          </p>
        </div>
      )}
    </div>
  );
}
