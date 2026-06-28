/** Suno tracks Luke made for Leo, bundled under public/leo/music. */
export interface Track {
  title: string;
  file: string;
}

export const TRACKS: Track[] = [
  { title: 'Leo Brings the Light', file: 'leo-brings-the-light.mp3' },
  { title: 'Leo Came with the Summer', file: 'leo-came-with-the-summer.mp3' },
  { title: 'Grow With You', file: 'grow-with-you.mp3' },
  { title: 'Leo, Summer', file: 'leo-summer.mp3' },
  { title: 'Leo Time', file: 'leo-time.mp3' },
  { title: 'Little Leo Rise (Liquid DnB)', file: 'little-leo-rise-dnb.mp3' },
  { title: 'Leo In The Light (DnB Remix)', file: 'leo-in-the-light-dnb.mp3' },
  {
    title: 'Christina’s Smile (Jungle Mix)',
    file: 'christinas-smile-jungle.mp3',
  },
  {
    title: 'Leo Came with the Summer (II)',
    file: 'leo-came-with-the-summer-2.mp3',
  },
];

export const MUSIC_VOLUME = 0.6;

/** Index of the track for a saved filename (0 / first when unknown). */
export function trackIndexFor(file: string | undefined): number {
  const i = file ? TRACKS.findIndex((t) => t.file === file) : -1;
  return i >= 0 ? i : 0;
}

/** Per-slide durations behind the friendly "speed" presets. */
export const SPEED_PRESETS: { label: string; ms: number }[] = [
  { label: 'Calm', ms: 7000 },
  { label: 'Gentle', ms: 5200 },
  { label: 'Lively', ms: 3500 },
];
export const DEFAULT_SLIDE_MS = 5200;

/** Backdrop themes for the slideshow stage. */
export const THEMES: { key: 'night' | 'dawn' | 'gold'; label: string }[] = [
  { key: 'night', label: 'Starry night' },
  { key: 'dawn', label: 'Dawn' },
  { key: 'gold', label: 'Golden' },
];
