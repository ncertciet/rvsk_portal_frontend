import { useCallback, useEffect, useRef, useState } from 'react';
import { autoSave } from '../vskApi';

interface UseAutoSaveOptions {
  step: number;
  getData: () => Record<string, unknown>;
  enabled: boolean; // false when read-only or submitted
}

interface UseAutoSaveReturn {
  isSaving: boolean;
  triggerSave: () => void;
  lastSavedAt: Date | null;
}

const AUTO_SAVE_INTERVAL = 30_000; // 30 seconds
const DEBOUNCE_DELAY = 2_000; // 2 seconds

/**
 * Auto-save hook for the VSK wizard steps.
 *
 * - Periodically saves (every 30s) if data has changed since last save.
 * - Provides a `triggerSave` function for field blur events (debounced 2s).
 * - Silently swallows errors — never shows error toasts.
 * - Does nothing when `enabled` is false (read-only / submitted state).
 */
export function useAutoSave(options: UseAutoSaveOptions): UseAutoSaveReturn {
  const { step, getData, enabled } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Refs for dirty-checking and timers
  const lastSavedJsonRef = useRef<string>('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep options in refs so the save logic always uses the latest values
  const stepRef = useRef(step);
  const getDataRef = useRef(getData);
  const enabledRef = useRef(enabled);

  stepRef.current = step;
  getDataRef.current = getData;
  enabledRef.current = enabled;

  /**
   * Core save logic — checks for dirty data, calls API, updates state.
   * Silently catches all errors.
   */
  const performSave = useCallback(async () => {
    if (!enabledRef.current) return;

    const data = getDataRef.current();
    const currentJson = JSON.stringify(data);

    // Skip if data hasn't changed since last save
    if (currentJson === lastSavedJsonRef.current) return;

    setIsSaving(true);
    try {
      await autoSave({ step: stepRef.current, data });
      lastSavedJsonRef.current = currentJson;
      setLastSavedAt(new Date());
    } catch {
      // Silent failure — never show error toast for auto-save
    } finally {
      setIsSaving(false);
    }
  }, []);

  /**
   * Debounced trigger for field blur events.
   * Callers invoke this on blur; it waits 2s before actually saving.
   */
  const triggerSave = useCallback(() => {
    if (!enabledRef.current) return;

    // Clear any pending debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      performSave();
    }, DEBOUNCE_DELAY);
  }, [performSave]);

  // Set up the 30s interval
  useEffect(() => {
    if (!enabled) {
      // Clear interval when disabled
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      performSave();
    }, AUTO_SAVE_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, performSave]);

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return { isSaving, triggerSave, lastSavedAt };
}
