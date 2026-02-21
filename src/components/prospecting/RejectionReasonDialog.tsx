import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import type { RejectionReason } from '@/types/prospect';
import { REJECTION_REASON_LABELS } from '@/types/prospect';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: RejectionReason, notes?: string) => void;
}

export function RejectionReasonDialog({ open, onOpenChange, onConfirm }: Props) {
  const [reason, setReason] = useState<RejectionReason | ''>('');
  const [notes, setNotes] = useState('');

  const isValid = reason && (reason !== 'outro' || notes.trim());

  const handleConfirm = () => {
    if (!isValid || !reason) return;
    onConfirm(reason, notes.trim() || undefined);
    setReason('');
    setNotes('');
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setReason('');
      setNotes('');
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Motivo — Não Prosseguir</DialogTitle>
          <DialogDescription>Informe o motivo pelo qual este prospect não será prosseguido.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Motivo *</Label>
            <Select value={reason} onValueChange={(v) => setReason(v as RejectionReason)}>
              <SelectTrigger><SelectValue placeholder="Selecione o motivo" /></SelectTrigger>
              <SelectContent>
                {(Object.entries(REJECTION_REASON_LABELS) as [RejectionReason, string][]).map(
                  ([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>

          {reason === 'outro' && (
            <div>
              <Label>Detalhes *</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Descreva o motivo..."
                className="min-h-[80px]"
              />
            </div>
          )}

          {reason && reason !== 'outro' && (
            <div>
              <Label>Observação (opcional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observação adicional..."
                className="min-h-[60px]"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancelar</Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={!isValid}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
