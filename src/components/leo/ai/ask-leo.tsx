'use client';

import { Chat } from './chat';
import { FileReportButton } from './file-report-sheet';

/**
 * The Ask Leo screen — a back-and-forth conversation (see `Chat`), plus a
 * "file a note/report" entry so the AI can sort pasted notes into the app
 * (each change confirmed before it's saved).
 */
export function AskLeo() {
  return (
    <div className="space-y-4">
      <FileReportButton />
      <Chat />
    </div>
  );
}
