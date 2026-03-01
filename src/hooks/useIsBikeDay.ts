import { useMemo } from 'react';
import { isBikeDay } from '@/services/schedule-service';
import type { Schedule } from '@/services/schedule-service';

/**
 * Hook to determine if today is a NO BIKE day
 * @param schedules - Array of schedule objects
 * @param date - The date to check (defaults to today)
 * @returns true if it's a NO BIKE day, false otherwise
 */
export function useIsBikeDay(schedules: Schedule[], date: Date = new Date()): boolean | undefined {
  return useMemo(() => {
    if (schedules.length === 0) return undefined; 
    return schedules.some(sch => isBikeDay(date, sch));
  }, [schedules, date]);
}
