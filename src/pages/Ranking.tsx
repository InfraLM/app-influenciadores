import { useState } from 'react';
import { Trophy, Info, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useRanking } from '@/hooks/useRanking';
import { useOwnEvaluation } from '@/hooks/usePerformanceEvaluations';

export default function Ranking() {
  const { isTeam, influencerId } = useAuth();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
  );

  // Use the secure RPC-based ranking hook (visible to ALL authenticated users)
  const { data: ranking = [], isLoading } = useRanking(selectedMonth);

  // Fetch own detailed evaluation (only for influencers viewing their own breakdown)
  const { data: ownEvaluation } = useOwnEvaluation(selectedMonth);

  // Generate month options (last 12 months)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    return {
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
    };
  });

  const getMedalColor = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.3)]';
      case 2:
        return 'bg-gray-400/20 text-gray-400 border-gray-400/50';
      case 3:
        return 'bg-amber-700/20 text-amber-600 border-amber-600/50';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="page-header">
          <h1 className="page-title flex items-center gap-2">
            <Trophy className="h-7 w-7 text-primary" />
            Ranking
          </h1>
          <p className="page-description">
            Ranking mensal dos influenciadores parceiros
          </p>
        </div>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-48">
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

      {/* Scoring Rules */}
      <div className="stat-card">
        <div className="flex items-center gap-2 mb-4">
          <Info className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Critérios de Pontuação</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-lg border bg-card/50 p-3">
            <p className="text-sm font-medium">Qualidade</p>
            <p className="text-xs text-muted-foreground">Até 3 pontos</p>
          </div>
          <div className="rounded-lg border bg-card/50 p-3">
            <p className="text-sm font-medium">Vendas</p>
            <p className="text-xs text-muted-foreground">Até 4 pontos</p>
          </div>
          <div className="rounded-lg border bg-card/50 p-3">
            <p className="text-sm font-medium">Engajamento</p>
            <p className="text-xs text-muted-foreground">Até 2 pontos</p>
          </div>
          <div className="rounded-lg border bg-card/50 p-3">
            <p className="text-sm font-medium">Postura</p>
            <p className="text-xs text-muted-foreground">Até 1 ponto</p>
          </div>
          <div className="rounded-lg border bg-card/50 p-3">
            <p className="text-sm font-medium">Bônus</p>
            <p className="text-xs text-muted-foreground">Até 3 pontos</p>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Ranking Table */}
      {!isLoading && (
        <div className="space-y-3">
          {ranking.map((entry) => {
            const isOwnRanking = influencerId === entry.influencerId;
            // Score breakdown: admins see all, influencers see only their own
            const canSeeDetails = isTeam || isOwnRanking;

            return (
              <div
                key={entry.influencerId}
                className={`stat-card transition-all ${
                  entry.isTopThree ? 'border-primary/30' : ''
                } ${isOwnRanking ? 'ring-2 ring-primary' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-xl border-2 font-bold text-xl ${getMedalColor(
                      entry.position
                    )}`}
                  >
                    {entry.position}º
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-lg">{entry.influencerName}</p>
                      {isOwnRanking && (
                        <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                          Você
                        </span>
                      )}
                      {entry.totalScore === 0 && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          Sem avaliação
                        </span>
                      )}
                    </div>
                    {entry.instagram && (
                      <p className="text-sm text-muted-foreground">{entry.instagram}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">{entry.totalScore}</p>
                    <p className="text-sm text-muted-foreground">pontos</p>
                  </div>
                </div>

                {/* Score Breakdown - only for own profile (influencer) or team/admin */}
                {canSeeDetails && isOwnRanking && ownEvaluation && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm font-medium text-muted-foreground mb-3">
                      Detalhamento da sua pontuação
                    </p>
                    <div className="grid gap-2 sm:grid-cols-5">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="rounded-lg bg-muted/50 p-2 cursor-help">
                            <p className="text-xs text-muted-foreground">Qualidade</p>
                            <p className="font-bold">{ownEvaluation.content_quality_score}/3</p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Clareza, storytelling, qualidade visual, alinhamento, linguagem, aprendizado prático</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="rounded-lg bg-muted/50 p-2 cursor-help">
                            <p className="text-xs text-muted-foreground">Vendas</p>
                            <p className="font-bold">{ownEvaluation.sales_score}/4</p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>0 vendas = 0pts, 1 = 1pt, 2 = 2pts, 3 = 3pts, 4+ = 4pts</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="rounded-lg bg-muted/50 p-2 cursor-help">
                            <p className="text-xs text-muted-foreground">Engajamento</p>
                            <p className="font-bold">{ownEvaluation.engagement_score}/2</p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Taxa = (Interações ÷ Alcance) × 100. {'<1%'}=0, 1-2.9%=1, 3-4.9%=1.5, 5%+=2</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="rounded-lg bg-muted/50 p-2 cursor-help">
                            <p className="text-xs text-muted-foreground">Postura</p>
                            <p className="font-bold">{ownEvaluation.partner_posture_score}/1</p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Comunicação adequada e cumprimento de prazos</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="rounded-lg bg-muted/50 p-2 cursor-help">
                            <p className="text-xs text-muted-foreground">Bônus</p>
                            <p className="font-bold">{ownEvaluation.bonus_score}/3</p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Stories extras, prints de interação, outras redes, reels extras</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                )}

                {/* Admin: show full breakdown for any influencer using evaluation from ranking data */}
                {isTeam && !isOwnRanking && entry.totalScore > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground italic">
                      Detalhamento disponível na aba Avaliação de Performance
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && ranking.length === 0 && (
        <div className="stat-card text-center py-12">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum influenciador ativo cadastrado</p>
        </div>
      )}
    </div>
  );
}
