import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Bug } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ContentDebugPanelProps {
  selectedMonth: string;
}

export function ContentDebugPanel({ selectedMonth }: ContentDebugPanelProps) {
  const { user, role, influencerId, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);

  if (!isAdmin) return null;

  return (
    <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-3">
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 text-xs text-muted-foreground"
        onClick={() => setOpen(!open)}
      >
        <Bug className="h-3 w-3" />
        Debug Info (Admin)
      </Button>

      {open && (
        <div className="mt-2 space-y-1 text-xs font-mono text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-semibold">user.id:</span>
            <span className="select-all">{user?.id || '—'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">role:</span>
            <Badge variant="outline" className="text-xs h-5">{role || '—'}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">influencerId:</span>
            <span className={`select-all ${!influencerId ? 'text-destructive font-bold' : ''}`}>
              {influencerId || 'NULL ⚠️'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">monthYear:</span>
            <span>{selectedMonth}</span>
          </div>
        </div>
      )}
    </div>
  );
}
