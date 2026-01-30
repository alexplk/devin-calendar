import { z } from 'zod';

/**
 * Loads schedule data from GitHub in production, local file in development
 * This is a client-side function for use in browser environments
 */
export async function loadSchedulesClient(): Promise<unknown[]> {
  const isGitHubPages = typeof window !== 'undefined' && window.location.hostname === 'alexplk.github.io';
  
  if (isGitHubPages) {
    // In production on GitHub Pages, fetch from main branch
    const url = 'https://raw.githubusercontent.com/alexplk/devin-calendar/main/src/assets/schedules.json';
    const response = await fetch(url, { cache: 'no-store' });
    
    if (!response.ok) {
      throw new Error(`Failed to load schedules from GitHub: ${response.statusText}`);
    }
    
    return response.json();
  } else {
    // In development, use local data
    const schedulesData = await import('@/assets/schedules.json');
    return schedulesData.default;
  }
}

/**
 * Schedule schema defines the bike schedule pattern
 * @example
 * {
 *   start: '2026-01-01',      // optional
 *   end: '2026-12-31',        // optional
 *   on: 4,                    // 4 days on bike
 *   off: 4,                   // 4 days off bike
 *   onMessage: 'BIKE',        // optional message for bike days
 *   offMessage: 'NO BIKE',    // optional message for no-bike days
 *   forecasts: [              // optional forecast messages by cycle position
 *     "Four more days of NO BIKE",
 *     "Three days of NO BIKE",
 *     "Tomorrow is the last day of NO BIKE",
 *     "Tomorrow is looking BIKE",
 *     "Four more days of BIKE",
 *     ...
 *   ]
 * }
 */
export const ScheduleSchema = z.object({
  start: z.string().date('Invalid date format, use YYYY-MM-DD').optional(),
  end: z.string().date('Invalid date format, use YYYY-MM-DD').optional(),
  on: z.number().int().positive('On days must be positive'),
  off: z.number().int().positive('Off days must be positive'),
  onMessage: z.string().optional(),
  offMessage: z.string().optional(),
  forecasts: z.array(z.string()).optional(),
});

export type Schedule = z.infer<typeof ScheduleSchema>;

/**
 * Validates a schedule object against the schema
 */
export function validateSchedule(data: unknown): Schedule {
  return ScheduleSchema.parse(data);
}

/**
 * Safely validates a schedule object
 */
export function validateScheduleSafe(data: unknown) {
  return ScheduleSchema.safeParse(data);
}

/**
 * Determines if a given date is a bike day based on the schedule
 */
export function isBikeDay(date: Date, schedule: Schedule): boolean {
  const startDate = schedule.start ? new Date(schedule.start) : null;
  const endDate = schedule.end ? new Date(schedule.end) : null;

  // Check if date is within schedule range
  if (startDate && date < startDate) {
    return false;
  }
  if (endDate && date > endDate) {
    return false;
  }

  // Calculate days elapsed from start (use epoch if no start date)
  const reference = startDate || new Date(0);
  const daysElapsed = Math.floor(
    (date.getTime() - reference.getTime()) / (1000 * 60 * 60 * 24)
  );

  const cycleLength = schedule.on + schedule.off;
  const positionInCycle = daysElapsed % cycleLength;

  // If position is within the "on" days, it's a bike day
  return positionInCycle < schedule.on;
}

/**
 * Gets the forecast message for a date based on its position in the cycle
 * Returns the message at the index matching the cycle position
 * Returns empty string if no forecast defined for that position
 */
export function getForecastMessage(date: Date, schedule: Schedule): string {
  if (!schedule.forecasts || schedule.forecasts.length === 0) {
    return '';
  }

  const startDate = schedule.start ? new Date(schedule.start) : null;
  const endDate = schedule.end ? new Date(schedule.end) : null;

  // Check if date is within schedule range
  if (startDate && date < startDate) {
    return '';
  }
  if (endDate && date > endDate) {
    return '';
  }

  // Calculate position in cycle
  const reference = startDate || new Date(0);
  const daysElapsed = Math.floor(
    (date.getTime() - reference.getTime()) / (1000 * 60 * 60 * 24)
  );

  const cycleLength = schedule.on + schedule.off;
  const positionInCycle = daysElapsed % cycleLength;

  return schedule.forecasts[positionInCycle] ?? '';
}

/**
 * Gets the messages for a date based on all schedules
 * Returns messages concatenated with newlines
 * Returns empty string if no messages apply
 */
export function getScheduleMessage(date: Date, schedules: Schedule[]): string {
  const messages = schedules
    .map(schedule => {
      const startDate = schedule.start ? new Date(schedule.start) : null;
      const endDate = schedule.end ? new Date(schedule.end) : null;

      // Check if date is within schedule range
      if (startDate && date < startDate) {
        return '';
      }
      if (endDate && date > endDate) {
        return '';
      }

      const bikeDay = isBikeDay(date, schedule);
      return bikeDay ? (schedule.onMessage ?? '') : (schedule.offMessage ?? '');
    })
    .filter(msg => msg.length > 0);

  return messages.join('\n');
}
