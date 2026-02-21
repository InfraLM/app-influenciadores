import { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import type { MonthlyGoals } from '@/hooks/useMonthlyGoals';

interface MonthlyGoalsDialogProps {
  monthYear: string;
  monthLabel: string;
  goals: MonthlyGoals | null;
  onSave: (goals: Omit<MonthlyGoals, 'id'>) => Promise<unknown>;
  isSaving: boolean;
}

export function MonthlyGoalsDialog({
  monthYear,
  monthLabel,
  goals,
  onSave,
  isSaving,
}: MonthlyGoalsDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    target_active_influencers: 0,
    target_registered_contents: 0,
    target_leads: 0,
    target_sales: 0,
  });

  useEffect(() => {
    if (goals) {
      setForm({
        target_active_influencers: goals.target_active_influencers,
        target_registered_contents: goals.target_registered_contents,
        target_leads: goals.target_leads,
        target_sales: goals.target_sales,
      });
    } else {
      setForm({
        target_active_influencers: 0,
        target_registered_contents: 0,
        target_leads: 0,
        target_sales: 0,
      });
    }
  }, [goals, open]);

  const handleSave = async () => {
    try {
      await onSave({ month_year: monthYear, ...form });
      toast({ title: 'Metas salvas com sucesso!' });
      setOpen(false);
    } catch (err) {
      console.error('Error saving goals:', err);
      toast({
        title: 'Erro ao salvar metas',
        description: String(err),
        variant: 'destructive',
      });
    }
  };

  const fields = [
    { key: 'target_active_influencers' as const, label: 'Influenciadores Ativos' },
    { key: 'target_registered_contents' as const, label: 'Conteúdos Registrados' },
    { key: 'target_leads' as const, label: 'Leads' },
    { key: 'target_sales' as const, label: 'Vendas' },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil className="h-4 w-4" />
          Editar metas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Metas do mês</DialogTitle>
          <DialogDescription>
            Defina as metas para {monthLabel}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {fields.map((field) => (
            <div key={field.key} className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={field.key} className="col-span-2 text-right text-sm">
                {field.label}
              </Label>
              <Input
                id={field.key}
                type="number"
                min={0}
                className="col-span-2"
                value={form[field.key]}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    [field.key]: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar metas'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
