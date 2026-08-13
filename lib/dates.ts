/**
 * Day-key helpers for daily tracking.
 *
 * The Appwrite build derived the day key with `new Date().toISOString().split("T")[0]`,
 * which converts to UTC first. For a user in UTC-8 logging a check-in at 5pm
 * local, that produced *tomorrow's* date — so evening entries landed on the
 * wrong day and could overwrite the next day's record. These helpers stay in
 * the device's local timezone.
 */

/** Local calendar date as YYYY-MM-DD. */
export function toEntryDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Parse a YYYY-MM-DD key back into a local Date at midnight. */
export function fromEntryDate(entryDate: string): Date {
  const [year, month, day] = entryDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Whole days elapsed between two instants, floored. */
export function daysBetween(from: Date, to: Date = new Date()): number {
  return Math.floor((to.getTime() - from.getTime()) / 86_400_000);
}

/** Local date key offset by a number of days. */
export function shiftEntryDate(entryDate: string, days: number): string {
  const date = fromEntryDate(entryDate);
  date.setDate(date.getDate() + days);
  return toEntryDate(date);
}

export function isToday(date: Date): boolean {
  return toEntryDate(date) === toEntryDate();
}
