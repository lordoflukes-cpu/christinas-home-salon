/**
 * "File this for me" — the shared prompt + schema + validator that turns a
 * pasted report / red-book notes / plain instruction into a list of PROPOSED
 * actions across the app (profile, medical, red-book notes, symptoms, feeds,
 * nappies, sleep, milestones, journal, reminder timings).
 *
 * The AI only ever PROPOSES; the parent confirms each action before anything is
 * written (see file-report-sheet.tsx). Pure — no React/IndexedDB — so it can be
 * unit tested and imported on the server. Medical doses/names are copied
 * verbatim, never invented.
 */
import { z } from 'zod';

export const EXTRACT_SYSTEM = `You convert a parent's pasted report, red-book notes, or instruction about their baby Leo into structured actions for a baby-tracking app.

Return ONLY a JSON object {"actions": [ ... ]} and nothing else (no prose, no markdown). Each action has a "type", a short human "summary", and the relevant fields:
- {"type":"profile","summary":"Set GP to Dr Patel","fields":{"name":"Leo","birth":"2026-06-24T22:54","birthPlace":"...","gp":"Dr Patel","healthVisitor":"...","allergies":"...","birthWeightGrams":3400,"birthLengthCm":51,"birthHeadCircCm":35,"hospital":"...","midwife":"...","doctor":"...","nhsNumber":"...","parents":"...","birthStory":"..."}}
- {"type":"medical","summary":"Red-book: 8-week check","medicalKind":"note|appointment|vaccination|medication","title":"...","when":"2026-06-20","category":"GP|Health visitor|Hospital|Midwife","note":"...","batch":"...","reaction":"..."}
- {"type":"event","summary":"Rash, mild","eventKind":"symptom|temperature|medication|mood|cry","when":"2026-06-26T09:00","symptom":"runny nose","severity":"mild|moderate|severe","tempC":38,"medName":"Calpol","dose":"2.5ml","mood":"unsettled","note":"..."}
- {"type":"feed","summary":"Bottle 90ml","feedType":"breast|bottle","amountMl":90,"contents":"formula|breastmilk","side":"L|R","durationMin":12}
- {"type":"diaper","summary":"Dirty nappy","diaperType":"wet|dirty|both","color":"yellow"}
- {"type":"sleep","summary":"Nap"}
- {"type":"milestone","summary":"First smile","title":"First smile","note":"..."}
- {"type":"note","summary":"Journal note","body":"..."}
- {"type":"reminders","summary":"Feed reminder every 3h","feedHours":3,"sleepMaxHours":2,"vitdTime":"09:00","quietStart":"22:00","quietEnd":"07:00"}

Rules: extract ONLY what is clearly stated. Omit any field you're unsure of. NEVER invent medication names, doses, numbers, dates or measurements — copy them exactly or leave them out. Use "when" as an ISO date (YYYY-MM-DD) or date-time when a clear date is given; otherwise omit it. For the baby's own date & time of birth, set fields.birth as an ISO date-time (e.g. "2026-06-24T22:54"). Put all baby profile details (name, birth, place of birth, parents, hospital, midwife, doctor, NHS number, GP, health visitor, allergies, measurements, birth story) into a single "profile" action's fields. Put red-book / health-visitor / check-up notes as type "medical" with medicalKind "note". If nothing is loggable, return {"actions": []}. Keep each "summary" short and human.`;

export const actionSchema = z.object({
  type: z.enum([
    'profile',
    'medical',
    'event',
    'feed',
    'diaper',
    'sleep',
    'milestone',
    'note',
    'reminders',
  ]),
  summary: z.string().min(1).max(300),
  /** ISO date / date-time when the thing happened (medical/event). */
  when: z.string().max(40).optional(),

  // profile
  fields: z
    .object({
      name: z.string().max(80).optional(),
      /** Date & time of birth as an ISO string (YYYY-MM-DD or with time). */
      birth: z.string().max(40).optional(),
      birthPlace: z.string().max(120).optional(),
      parents: z.string().max(160).optional(),
      hospital: z.string().max(120).optional(),
      midwife: z.string().max(120).optional(),
      doctor: z.string().max(120).optional(),
      nhsNumber: z.string().max(40).optional(),
      gp: z.string().max(120).optional(),
      healthVisitor: z.string().max(120).optional(),
      allergies: z.string().max(1000).optional(),
      birthStory: z.string().max(3000).optional(),
      birthWeightGrams: z.number().positive().max(10000).optional(),
      birthLengthCm: z.number().positive().max(120).optional(),
      birthHeadCircCm: z.number().positive().max(80).optional(),
    })
    .optional(),

  // medical
  medicalKind: z
    .enum(['appointment', 'vaccination', 'medication', 'note'])
    .optional(),
  title: z.string().max(200).optional(),
  category: z.string().max(60).optional(),
  batch: z.string().max(60).optional(),
  reaction: z.string().max(500).optional(),

  // event
  eventKind: z
    .enum(['cry', 'temperature', 'medication', 'symptom', 'mood'])
    .optional(),
  symptom: z.string().max(120).optional(),
  severity: z.enum(['mild', 'moderate', 'severe']).optional(),
  tempC: z.number().min(25).max(45).optional(),
  medName: z.string().max(80).optional(),
  dose: z.string().max(80).optional(),
  mood: z
    .enum(['calm', 'content', 'alert', 'sleepy', 'unsettled', 'fussy'])
    .optional(),
  note: z.string().max(2000).optional(),

  // feed
  feedType: z.enum(['breast', 'bottle']).optional(),
  amountMl: z.number().nonnegative().max(2000).optional(),
  contents: z.enum(['formula', 'breastmilk']).optional(),
  side: z.enum(['L', 'R']).optional(),
  durationMin: z.number().nonnegative().max(600).optional(),

  // diaper
  diaperType: z.enum(['wet', 'dirty', 'both']).optional(),
  color: z.string().max(40).optional(),

  // milestone / journal
  body: z.string().max(2000).optional(),

  // reminders
  feedHours: z.number().positive().max(24).optional(),
  sleepMaxHours: z.number().positive().max(24).optional(),
  vitdTime: z
    .string()
    .regex(/^\d{1,2}:\d{2}$/)
    .optional(),
  quietStart: z
    .string()
    .regex(/^\d{1,2}:\d{2}$/)
    .optional(),
  quietEnd: z
    .string()
    .regex(/^\d{1,2}:\d{2}$/)
    .optional(),
});

export type ProposedAction = z.infer<typeof actionSchema>;

export interface ProposedActions {
  actions: ProposedAction[];
}

const MAX_ACTIONS = 30;

/**
 * Pull the JSON payload out of a model reply, tolerating ```json fences and any
 * stray prose around it (tries the whole string, a fenced block, then the
 * widest `{…}` / `[…]` span). Returns the parsed value or null.
 */
function extractJson(text: string): unknown {
  const candidates: string[] = [];
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) candidates.push(fence[1].trim());
  candidates.push(text.trim());
  const objStart = text.indexOf('{');
  const objEnd = text.lastIndexOf('}');
  if (objStart !== -1 && objEnd > objStart)
    candidates.push(text.slice(objStart, objEnd + 1));
  const arrStart = text.indexOf('[');
  const arrEnd = text.lastIndexOf(']');
  if (arrStart !== -1 && arrEnd > arrStart)
    candidates.push(text.slice(arrStart, arrEnd + 1));
  for (const c of candidates) {
    try {
      return JSON.parse(c);
    } catch {
      /* try the next candidate */
    }
  }
  return null;
}

/**
 * Last-resort recovery for a truncated or slightly-malformed reply: scan for the
 * actions array and pull out each COMPLETE top-level `{…}` object (string-aware,
 * brace-matched), parsing each on its own. A cut-off final object is simply
 * skipped — so a response truncated at the token limit still yields everything
 * that came before the cut. Returns the parsed objects, or null if none.
 */
function salvageObjects(text: string): unknown[] | null {
  const start = text.indexOf('[');
  if (start === -1) return null;
  const objs: unknown[] = [];
  let depth = 0;
  let inStr = false;
  let esc = false;
  let objStart = -1;
  for (let i = start + 1; i < text.length; i++) {
    const ch = text[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === '{') {
      if (depth === 0) objStart = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0 && objStart !== -1) {
        try {
          objs.push(JSON.parse(text.slice(objStart, i + 1)));
        } catch {
          /* skip a malformed object */
        }
        objStart = -1;
      }
    } else if (ch === ']' && depth === 0) {
      break;
    }
  }
  return objs.length ? objs : null;
}

/**
 * Parse the model's reply into proposed actions. Resilient on purpose: accepts
 * `{"actions":[…]}` or a bare `[…]`, copes with prose/fences around the JSON,
 * and validates each action INDIVIDUALLY so one malformed entry never discards
 * the whole batch. Returns null only when no JSON at all can be found.
 */
export function parseActions(text: string): ProposedActions | null {
  const data = extractJson(text);
  let list: unknown[] | null = Array.isArray(data)
    ? data
    : data && Array.isArray((data as { actions?: unknown }).actions)
      ? (data as { actions: unknown[] }).actions
      : null;
  // Whole-document parse failed (often a truncated reply) — recover object by
  // object so a response cut off at the token limit still files what it can.
  if (!list) list = salvageObjects(text);
  if (!list) return null;
  const actions: ProposedAction[] = [];
  for (const item of list) {
    const res = actionSchema.safeParse(item);
    if (res.success) actions.push(res.data);
    if (actions.length >= MAX_ACTIONS) break;
  }
  return { actions };
}

/** Which area an action writes to — for grouping/labelling the confirm list. */
export function actionArea(a: ProposedAction): string {
  switch (a.type) {
    case 'profile':
      return 'Profile';
    case 'medical':
      return a.medicalKind === 'note' ? 'Red book' : 'Health';
    case 'event':
      return 'Health';
    case 'reminders':
      return 'Reminders';
    case 'note':
      return 'Journal';
    case 'milestone':
      return 'Milestones';
    default:
      return 'Daily log';
  }
}
