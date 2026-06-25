'use client';

import { useState } from 'react';
import { FileText, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { useLeoStore, formatDateTime } from '@/lib/leo';
import type { DocumentEntry } from '@/lib/leo';
import { DocumentForm } from '../documents/document-form';

export function DocumentsSection() {
  const documents = useLeoStore((s) => s.documents);
  const removeDocument = useLeoStore((s) => s.removeDocument);
  const [sheetOpen, setSheetOpen] = useState(false);

  function open(doc: DocumentEntry) {
    const blob = new Blob([doc.bytes], { type: doc.type });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener');
    // Revoke after a delay so the new tab can load it.
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  return (
    <div className="space-y-4">
      <Card className="border-ink-300/40 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink-900">
            <FileText className="h-5 w-5 text-aegean-500" /> Documents
          </h2>
          <Button
            onClick={() => setSheetOpen(true)}
            size="sm"
            variant="outline"
            className="border-aegean-300 text-aegean-700"
          >
            <Plus className="mr-1 h-4 w-4" /> Add
          </Button>
        </div>
        <p className="mb-3 text-xs text-ink-500">
          Letters, prescriptions, results — photos or PDFs, kept safe and shared
          between phones.
        </p>

        {documents.length === 0 ? (
          <p className="py-2 text-sm text-ink-500">No documents yet.</p>
        ) : (
          <div>
            {documents.map((doc) => {
              const isImage = doc.type.startsWith('image/');
              const Icon = isImage ? ImageIcon : FileText;
              return (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 border-b border-ink-300/40 py-2.5 last:border-0"
                >
                  <button
                    type="button"
                    onClick={() => open(doc)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-aegean-100 text-aegean-600">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink-900">
                        {doc.title}
                      </span>
                      <span className="block text-xs text-ink-500">
                        {formatDateTime(doc.at)}
                      </span>
                    </span>
                  </button>
                  {doc.category && (
                    <Badge variant="secondary" className="shrink-0">
                      {doc.category}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDocument(doc.id)}
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-rose-500" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="border-ink-300/40">
          <SheetHeader className="mb-4">
            <SheetTitle className="font-display text-xl text-ink-900">
              Add a document
            </SheetTitle>
            <SheetDescription>
              Upload a photo or PDF of a letter, prescription or report.
            </SheetDescription>
          </SheetHeader>
          <DocumentForm onDone={() => setSheetOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
