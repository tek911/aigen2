// ============================================================================
// STRING UTILITIES
// ============================================================================

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, maxLength: number, suffix: string = "..."): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

// ============================================================================
// TIME UTILITIES
// ============================================================================

export function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${pluralize(count, interval.label, interval.label + "s")} ago`;
    }
  }

  return "just now";
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

export function formatTimer(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

// ============================================================================
// NUMBER UTILITIES
// ============================================================================

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function formatPercentage(value: number, total: number, decimals: number = 1): string {
  if (total === 0) return "0%";
  return `${((value / total) * 100).toFixed(decimals)}%`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ============================================================================
// COLOR UTILITIES
// ============================================================================

export function getColorForScore(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  if (score >= 40) return "text-orange-600";
  return "text-red-600";
}

export function getEloColor(elo: number): string {
  if (elo >= 2000) return "text-purple-600";
  if (elo >= 1800) return "text-blue-600";
  if (elo >= 1600) return "text-green-600";
  if (elo >= 1400) return "text-yellow-600";
  return "text-gray-600";
}

// ============================================================================
// ERROR UTILITIES
// ============================================================================

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
    public details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

// ============================================================================
// RANDOM UTILITIES
// ============================================================================

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// ============================================================================
// OBJECT UTILITIES
// ============================================================================

export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}
