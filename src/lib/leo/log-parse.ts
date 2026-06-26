/**
 * Voice → auto-log: the shared prompt + schema + parser used by the AI route
 * to turn a parent's spoken/typed note into structured log proposals.
 *
 * Kept pure (no server/Next imports) so the validation can be unit tested and
 * reused. Nothing here writes anything — it only validates a model's JSON.
 */
import { z } from 'zod';

export const LOG_SYSTEM = `You convert a parent's short note about their baby Leo into structured log entries.
Return ONLY a JSON object of the form {"entries": [ ... ]} and nothing else (no prose, no markdown).
Each entry is one of:
- {"kind":"feed","feedType":"bottle","amountMl":90,"contents":"formula","summary":"Bottle feed · 90ml formula"}
- {"kind":"feed","feedType":"breast","side":"L","durationMin":12,"summary":"Breast feed · left, 12 min"}
- {"kind":"diaper","diaperType":"wet|dirty|both","color":"yellow","summary":"Dirty nappy"}
- {"kind":"sleep","summary":"Fell asleep"}
- {"kind":"event","eventKind":"cry|temperature|medication|symptom|mood","tempC":38,"medName":"Calpol","dose":"2.5ml","symptom":"runny nose","mood":"unsettled","note":"...","summary":"Temperature 38°C"}
- {"kind":"milestone","title":"First smile","summary":"Milestone: First smile"}
- {"kind":"note","body":"...","summary":"Note saved"}
Rules: extract ONLY what is clearly stated; omit any field you're unsure of; NEVER invent medication names, doses or numbers; if nothing is loggable, return {"entries": []}. Keep each "summary" short and human.`;

export const logEntrySchema = z.object({
  kind: z.enum(['feed', 'diaper', 'sleep', 'event', 'milestone', 'note']),
  summary: z.string().min(1).max(120),
  feedType: z.enum(['breast', 'bottle']).optional(),
  amountMl: z.number().nonnegative().max(2000).optional(),
  contents: z.enum(['formula', 'breastmilk']).optional(),
  side: z.enum(['L', 'R']).optional(),
  durationMin: z.number().nonnegative().max(600).optional(),
  diaperType: z.enum(['wet', 'dirty', 'both']).optional(),
  color: z.string().max(40).optional(),
  eventKind: z
    .enum(['cry', 'temperature', 'medication', 'symptom', 'mood'])
    .optional(),
  tempC: z.number().min(25).max(45).optional(),
  medName: z.string().max(80).optional(),
  dose: z.string().max(80).optional(),
  symptom: z.string().max(120).optional(),
  mood: z
    .enum(['calm', 'content', 'alert', 'sleepy', 'unsettled', 'fussy'])
    .optional(),
  note: z.string().max(500).optional(),
  title: z.string().max(120).optional(),
  body: z.string().max(500).optional(),
});

export const logEntriesSchema = z.object({
  entries: z.array(logEntrySchema).max(8),
});

export type LogEntries = z.infer<typeof logEntriesSchema>;

/** Strip ```json fences and parse to the entries shape, or null on any failure. */
export function parseEntries(text: string): LogEntries | null {
  const cleaned = text
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/, '')
    .trim();
  try {
    const json = JSON.parse(cleaned);
    const res = logEntriesSchema.safeParse(json);
    return res.success ? res.data : null;
  } catch {
    return null;
  }
}
