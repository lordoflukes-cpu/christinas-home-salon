'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { VoiceCategory } from './types';

// ---------------------------------------------------------------------------
// Categories (pure config)
// ---------------------------------------------------------------------------

export interface VoiceCategoryConfig {
  category: VoiceCategory;
  label: string;
  emoji: string;
}

export const VOICE_CATEGORIES: VoiceCategoryConfig[] = [
  { category: 'firstSound', label: 'First sound', emoji: '👶' },
  { category: 'message', label: 'Message to Leo', emoji: '💌' },
  { category: 'funny', label: 'Funny', emoji: '😂' },
  { category: 'proud', label: 'Proud', emoji: '🥹' },
  { category: 'emotional', label: 'Emotional', emoji: '💗' },
];

export function voiceCategory(
  category: VoiceCategory | undefined,
): VoiceCategoryConfig | null {
  if (!category) return null;
  return VOICE_CATEGORIES.find((c) => c.category === category) ?? null;
}

// ---------------------------------------------------------------------------
// Duration formatting (pure)
// ---------------------------------------------------------------------------

/** Format a millisecond duration as `m:ss` (e.g. 42_000 → "0:42"). */
export function formatAudioDuration(ms: number | undefined): string {
  const total = Math.max(0, Math.round((ms ?? 0) / 1000));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// Object-URL hook for <audio> playback (mirrors usePhotoUrl)
// ---------------------------------------------------------------------------

/** Create a stable object URL for a Blob, revoked on change/unmount. */
export function useVoiceUrl(blob: Blob | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!blob) {
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);
  return url;
}

// ---------------------------------------------------------------------------
// Speech recognition (best-effort, on-device) — minimal typed shim
// ---------------------------------------------------------------------------

interface SpeechRecognitionResultLike {
  0: { transcript: string };
  isFinal: boolean;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: { length: number; [i: number]: SpeechRecognitionResultLike };
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** True if the browser can transcribe speech on-device (Chrome/Android best). */
export function isSpeechRecognitionSupported(): boolean {
  return getRecognitionCtor() !== null;
}

// ---------------------------------------------------------------------------
// Recorder hook — MediaRecorder + optional live transcription
// ---------------------------------------------------------------------------

export type RecorderState = 'idle' | 'recording' | 'recorded';

export interface VoiceRecorder {
  state: RecorderState;
  blob: Blob | null;
  /** Live/best-effort transcript; empty if recognition is unavailable. */
  transcript: string;
  setTranscript: (value: string) => void;
  durationMs: number;
  error: string | null;
  supportsTranscription: boolean;
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
}

/**
 * Records audio via MediaRecorder and, where supported, streams an on-device
 * speech transcript. All browser APIs are touched only inside handlers/effects
 * so this is safe to import from server components (it just won't do anything
 * until `start()` runs in the browser).
 */
export function useVoiceRecorder(): VoiceRecorder {
  const [state, setState] = useState<RecorderState>('idle');
  const [blob, setBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState('');
  const [durationMs, setDurationMs] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalRef = useRef('');
  const startedAtRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const supportsTranscription = isSpeechRecognitionSupported();

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
    recognitionRef.current = null;
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const start = useCallback(async () => {
    setError(null);
    setBlob(null);
    setTranscript('');
    setDurationMs(0);
    finalRef.current = '';
    chunksRef.current = [];

    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setError('Recording is not supported on this device.');
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError('Microphone permission is needed to record.');
      return;
    }
    streamRef.current = stream;

    const recorder = new MediaRecorder(stream);
    recorderRef.current = recorder;
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const type = recorder.mimeType || 'audio/webm';
      setBlob(new Blob(chunksRef.current, { type }));
      setState('recorded');
      cleanup();
    };
    recorder.start();

    startedAtRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setDurationMs(Date.now() - startedAtRef.current);
    }, 200);

    // Best-effort live transcription.
    const Ctor = getRecognitionCtor();
    if (Ctor) {
      try {
        const recognition = new Ctor();
        recognition.lang =
          typeof navigator !== 'undefined' && navigator.language
            ? navigator.language
            : 'en-GB';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onresult = (e) => {
          let interim = '';
          for (let i = e.resultIndex; i < e.results.length; i++) {
            const res = e.results[i];
            if (res.isFinal) finalRef.current += res[0].transcript;
            else interim += res[0].transcript;
          }
          setTranscript((finalRef.current + interim).trim());
        };
        recognition.onerror = () => {};
        recognition.onend = () => {};
        recognition.start();
        recognitionRef.current = recognition;
      } catch {
        /* recognition optional — audio still records */
      }
    }

    setState('recording');
  }, [cleanup]);

  const stop = useCallback(() => {
    setDurationMs(Date.now() - startedAtRef.current);
    try {
      recorderRef.current?.stop();
    } catch {
      cleanup();
      setState('recorded');
    }
  }, [cleanup]);

  const reset = useCallback(() => {
    cleanup();
    chunksRef.current = [];
    finalRef.current = '';
    setBlob(null);
    setTranscript('');
    setDurationMs(0);
    setError(null);
    setState('idle');
  }, [cleanup]);

  return {
    state,
    blob,
    transcript,
    setTranscript,
    durationMs,
    error,
    supportsTranscription,
    start,
    stop,
    reset,
  };
}

// ---------------------------------------------------------------------------
// One-shot speech input — for "talk to Leo" voice questions (no recording)
// ---------------------------------------------------------------------------

export interface SpeechInput {
  supported: boolean;
  listening: boolean;
  /** Live transcript (interim + final) while listening. */
  transcript: string;
  error: string | null;
  start: () => void;
  stop: () => void;
}

/**
 * Lightweight on-device speech-to-text for a single spoken question/command.
 * Calls `onFinal` with the final transcript when the user stops speaking.
 * Unlike `useVoiceRecorder` this keeps no audio — just the text.
 */
export function useSpeechInput(
  onFinal?: (text: string) => void,
  lang = 'en-GB',
): SpeechInput {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const finalRef = useRef('');
  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;

  const stop = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setError('Voice input isn’t supported on this device.');
      return;
    }
    finalRef.current = '';
    setTranscript('');
    setError(null);
    const rec = new Ctor();
    recRef.current = rec;
    rec.lang = lang;
    rec.continuous = false;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalRef.current += r[0].transcript;
        else interim += r[0].transcript;
      }
      setTranscript((finalRef.current + interim).trim());
    };
    rec.onerror = () => setError('Didn’t catch that — try again.');
    rec.onend = () => {
      setListening(false);
      const text = finalRef.current.trim();
      if (text) onFinalRef.current?.(text);
    };
    setListening(true);
    rec.start();
  }, [lang]);

  useEffect(
    () => () => {
      try {
        recRef.current?.stop();
      } catch {
        /* ignore */
      }
    },
    [],
  );

  return {
    supported: isSpeechRecognitionSupported(),
    listening,
    transcript,
    error,
    start,
    stop,
  };
}
