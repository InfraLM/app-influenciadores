import { useState, useMemo } from 'react';
import { Users, FileCheck, Target, ShoppingCart, Calendar, Loader2, Trophy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/dashboard/StatCard';
import { TopThreeCard } from '@/components/dashboard/TopThreeCard';
import { RankingHistoryCard } from '@/components/dashboard/RankingHistoryCard';
import { MonthlyGoalsDialog } from '@/components/dashboard/MonthlyGoalsDialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInfluencers } from '@/hooks/useInfluencers';
import { useContents } from '@/hooks/useContents';
import { useMonthlyEvaluations, useOwnEvaluation } from '@/hooks/usePerformanceEvaluations';
import { useInfluencerProfile } from '@/hooks/useInfluencerProfile';
import { useRanking } from '@/hooks/useRanking';
import { useMonthlyGoals } from '@/hooks/useMonthlyGoals';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { isTeam, isInfluencer, profile, influencerId, user } = useAuth();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
  );

  // Fetch real data from database
  const { influencers, loading: loadingInfluencers } = useInfluencers();
  const { data: contents = [], isLoading: loadingContents } = useContents(selectedMonth);
  const { data: evaluations = [], isLoading: loadingEvaluations } = useMonthlyEvaluations(selectedMonth);
  
  // For influencer: fetch their own profile and evaluation
  const influencerCurrentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const { influencer: influencerData } = useInfluencerProfile(user?.id);
  const { data: ownEvaluation } = useOwnEvaluation(influencerCurrentMonth);
  
  // Use secure RPC for ranking data (visible to all authenticated users)
  const { data: rankingData = [], isLoading: loadingRanking } = useRanking(
    isInfluencer ? influencerCurrentMonth : selectedMonth
  );

  // Monthly goals (admin only)
  const { goals, isLoading: loadingGoals, upsertGoals, isUpserting } = useMonthlyGoals(selectedMonth);

  // Generate month options (last 12 months)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    return {
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
    };
  });

  // Current month label for goals dialog
  const currentMonthLabel = monthOptions.find(o => o.value === selectedMonth)?.label || selectedMonth;
  
  // Calculate stats from real data
  const activeInfluencers = influencers.filter(i => i.status === 'active');
  const contentThisMonth = contents.length;
  const totalLeads = evaluations.reduce((sum, e) => sum + (e.leads || 0), 0);
  const totalSales = evaluations.reduce((sum, e) => sum + (e.sales || 0), 0);
  
  // Build top 3 from ranking data (for admin dashboard)
  const topThree = useMemo(() => {
    if (isTeam) {
      // Admin uses ranking from influencers + evaluations (which they can access)
      const evaluationMap = new Map(evaluations.map(e => [e.influencer_id, e]));
      
      const ranked = activeInfluencers
        .map(inf => ({
          position: 0,
          influencerId: inf.id,
          influencerName: inf.full_name,
          instagram: inf.instagram,
          totalScore: evaluationMap.get(inf.id)?.total_score || 0,
          isTopThree: false,
        }))
        .sort((a, b) => Number(b.totalScore) - Number(a.totalScore))
        .slice(0, 3)
        .map((entry, index) => ({
          ...entry,
          position: index + 1,
          isTopThree: true,
          totalScore: Number(entry.totalScore),
        }));
      
      return ranked;
    }
    return [];
  }, [isTeam, activeInfluencers, evaluations]);

  // For influencer: derive own position from ranking RPC data
  const ownRankingPosition = useMemo(() => {
    if (!influencerId || rankingData.length === 0) return null;
    const entry = rankingData.find(r => r.influencerId === influencerId);
    if (!entry) return null;
    return { position: entry.position, totalScore: entry.totalScore };
  }, [influencerId, rankingData]);

  // Top 3 from RPC data (for influencer dashboard)
  const rankingTopThree = useMemo(() => {
    return rankingData.slice(0, 3);
  }, [rankingData]);

  const isLoading = loadingInfluencers || loadingContents || loadingEvaluations || loadingRanking;

  if (isInfluencer) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Olá, {profile?.name || 'Influenciador'}!</h1>
          <p className="page-description">
            Acompanhe sua performance e registre seus conteúdos mensais
          </p>
        </div>

        {/* Posting reminder */}
        {influencerData?.posting_dates && influencerData.posting_dates.length > 0 && (
          <div className="rounded-xl border border-primary/30 bg-primary/10 p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Lembrete de Postagem</p>
                <p className="text-sm text-muted-foreground">
                  Suas datas de postagem: dia {influencerData.posting_dates.join(' e ')} de cada mês
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CTA to register content */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Registrar Conteúdos do Mês</h3>
              <p className="text-sm text-muted-foreground">
                Registre seus conteúdos publicados com comprovação
              </p>
            </div>
            <Button asChild>
              <Link to="/conteudos">Registrar Conteúdos</Link>
            </Button>
          </div>
        </div>

        {/* Top 3 + Own position */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="stat-card">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Top 3 do Mês
              </h3>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/ranking">Ver ranking completo</Link>
              </Button>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : rankingTopThree.length > 0 ? (
              <div className="space-y-3">
                {rankingTopThree.map((entry) => (
                  <div key={entry.influencerId} className="flex items-center gap-3 rounded-lg border bg-card/50 p-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full border font-bold text-sm ${
                      entry.position === 1 ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' :
                      entry.position === 2 ? 'bg-gray-400/20 text-gray-400 border-gray-400/30' :
                      'bg-amber-700/20 text-amber-600 border-amber-600/30'
                    }`}>
                      {entry.position}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {entry.influencerName}
                        {entry.influencerId === influencerId && (
                          <span className="ml-2 rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">Você</span>
                        )}
                      </p>
                      {entry.instagram && <p className="text-xs text-muted-foreground">{entry.instagram}</p>}
                    </div>
                    <p className="font-bold text-primary">{entry.totalScore} pts</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Nenhum dado disponível</p>
            )}
          </div>

          <div className="stat-card">
            <h3 className="mb-4 font-semibold">Sua Posição no Ranking</h3>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : ownRankingPosition ? (
              <div className="flex items-center gap-4">
                <div className={`flex h-16 w-16 items-center justify-center rounded-xl ${
                  ownRankingPosition.position <= 3 ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  <span className="text-2xl font-bold">{ownRankingPosition.position}º</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">{ownRankingPosition.totalScore} pontos</p>
                  <p className="text-sm text-muted-foreground">
                    de {rankingData.length} influenciadores ativos
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Sem dados para este mês</p>
            )}
          </div>
        </div>

        {/* History */}
        <RankingHistoryCard influencerId={influencerId || ''} />

        {/* Score breakdown */}
        {ownEvaluation && (
          <div className="stat-card">
            <h3 className="mb-4 font-semibold">Detalhamento da Pontuação</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-sm text-muted-foreground">Qualidade</p>
                <p className="text-xl font-bold">{ownEvaluation.content_quality_score}/3</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-sm text-muted-foreground">Vendas</p>
                <p className="text-xl font-bold">{ownEvaluation.sales_score}/4</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-sm text-muted-foreground">Engajamento</p>
                <p className="text-xl font-bold">{ownEvaluation.engagement_score}/2</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-sm text-muted-foreground">Postura</p>
                <p className="text-xl font-bold">{ownEvaluation.partner_posture_score}/1</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-sm text-muted-foreground">Bônus</p>
                <p className="text-xl font-bold">{ownEvaluation.bonus_score}/3</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Admin/Team Dashboard
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-description">
            Visão geral da plataforma de influenciadores
          </p>
        </div>
        <div className="flex items-center gap-3">
          <MonthlyGoalsDialog
            monthYear={selectedMonth}
            monthLabel={currentMonthLabel}
            goals={goals ?? null}
            onSave={upsertGoals}
            isSaving={isUpserting}
          />
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
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Influenciadores Ativos"
              value={activeInfluencers.length}
              icon={Users}
              goal={goals?.target_active_influencers ?? null}
            />
            <StatCard
              title="Conteúdos Registrados"
              value={contentThisMonth}
              description="Este mês"
              icon={FileCheck}
              goal={goals?.target_registered_contents ?? null}
            />
            <StatCard
              title="Leads do Mês"
              value={totalLeads}
              icon={Target}
              goal={goals?.target_leads ?? null}
            />
            <StatCard
              title="Vendas do Mês"
              value={totalSales}
              icon={ShoppingCart}
              goal={goals?.target_sales ?? null}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <TopThreeCard entries={topThree} />
            
            <div className="stat-card">
              <h3 className="mb-4 font-semibold">Registro de Conteúdos</h3>
              <div className="space-y-3">
                {activeInfluencers.map((influencer) => {
                  const hasContent = contents.some(
                    c => c.influencer_id === influencer.id
                  );
                  return (
                    <div
                      key={influencer.id}
                      className="flex items-center justify-between rounded-lg border bg-card/50 p-3"
                    >
                      <div>
                        <p className="font-medium">{influencer.full_name}</p>
                        <p className="text-sm text-muted-foreground">{influencer.instagram}</p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          hasContent
                            ? 'bg-success/20 text-success'
                            : 'bg-warning/20 text-warning'
                        }`}
                      >
                        {hasContent ? 'Registrado' : 'Pendente'}
                      </span>
                    </div>
                  );
                })}
                {activeInfluencers.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum influenciador ativo cadastrado
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
