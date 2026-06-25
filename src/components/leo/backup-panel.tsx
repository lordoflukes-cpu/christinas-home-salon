'use client';

import { useRef, useState } from 'react';
import { Download, Upload, Trash2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import {
  useLeoStore,
  leoRepo,
  leoBackupSchema,
  formatISODateSafe,
} from '@/lib/leo';

export function BackupPanel() {
  const importBackup = useLeoStore((s) => s.importBackup);
  const clearAll = useLeoStore((s) => s.clearAll);
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [clearOpen, setClearOpen] = useState(false);

  async function handleExport() {
    try {
      const backup = await leoRepo.exportAll();
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leo-backup-${formatISODateSafe(backup.exportedAt)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: 'Backup downloaded',
        description: 'Keep it somewhere safe 💙',
      });
    } catch {
      toast({
        title: 'Export failed',
        description: 'Could not read your data.',
        variant: 'destructive',
      });
    }
  }

  async function handleImportFile(file: File) {
    try {
      const parsed = leoBackupSchema.safeParse(JSON.parse(await file.text()));
      if (!parsed.success) {
        toast({
          title: 'Invalid backup file',
          description: 'This file doesn’t look like a Leo backup.',
          variant: 'destructive',
        });
        return;
      }
      await importBackup(parsed.data, 'replace');
      toast({ title: 'Backup restored', description: 'All entries are back.' });
    } catch {
      toast({
        title: 'Import failed',
        description: 'Could not read that file.',
        variant: 'destructive',
      });
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <Card className="border-ink-300/40 p-5">
      <h2 className="mb-1 font-display text-lg font-semibold text-ink-900">
        Backup &amp; restore
      </h2>
      <p className="mb-4 flex items-start gap-2 text-sm text-ink-600">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-ink-500" />
        Everything — entries, growth, milestones, letters and photos — lives
        only on this phone. Export a backup regularly so you never lose it
        (photos are included, so the file can be large).
      </p>

      <div className="space-y-3">
        <Button
          onClick={handleExport}
          size="lg"
          variant="outline"
          className="min-h-12 w-full justify-start"
        >
          <Download className="mr-2 h-5 w-5" /> Export backup (.json)
        </Button>

        <Button
          onClick={() => fileRef.current?.click()}
          size="lg"
          variant="outline"
          className="min-h-12 w-full justify-start"
        >
          <Upload className="mr-2 h-5 w-5" /> Restore from backup
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImportFile(file);
          }}
        />

        <Button
          onClick={() => setClearOpen(true)}
          size="lg"
          variant="ghost"
          className="min-h-12 w-full justify-start text-rose-600 hover:bg-rose-50 hover:text-rose-700"
        >
          <Trash2 className="mr-2 h-5 w-5" /> Clear all data
        </Button>
      </div>

      <Dialog open={clearOpen} onOpenChange={setClearOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Clear all data?</DialogTitle>
            <DialogDescription>
              This permanently deletes every feed, nappy, and sleep entry on
              this device. Export a backup first if you want to keep them.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={async () => {
                await clearAll();
                setClearOpen(false);
                toast({ title: 'Data cleared' });
              }}
            >
              Delete everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
