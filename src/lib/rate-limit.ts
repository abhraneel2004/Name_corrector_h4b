// Usage limits for the AI features, per user and across all users.
// Counts are kept in server memory, so each server instance counts separately. On hosts that run
// several instances, also cap Gemini usage in Google Cloud (APIs & Services → Quotas) as the hard limit.

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

type Window = { limit: number; windowMs: number; label: 'hour' | 'day' };

const LIMITS = {
  query: { noun: 'questions', gemini: true, perUser: [{ limit: 30, windowMs: HOUR, label: 'hour' }, { limit: 200, windowMs: DAY, label: 'day' }] },
  ocr: { noun: 'document scans', gemini: true, perUser: [{ limit: 40, windowMs: HOUR, label: 'hour' }, { limit: 200, windowMs: DAY, label: 'day' }] },
  audit: { noun: 'audits', gemini: false, perUser: [{ limit: 10, windowMs: HOUR, label: 'hour' }, { limit: 50, windowMs: DAY, label: 'day' }] },
  // The two Gemini calls each audit makes; only reachable directly if someone bypasses the audit limit
  auditStep: { noun: 'audit requests', gemini: true, perUser: [{ limit: 20, windowMs: HOUR, label: 'hour' }, { limit: 100, windowMs: DAY, label: 'day' }] },
} satisfies Record<string, { noun: string; gemini: boolean; perUser: Window[] }>;

export type LimitBucket = keyof typeof LIMITS;

// Across all users, because anyone can create an account
const GLOBAL_LIMITS: Window[] = [
  { limit: 600, windowMs: HOUR, label: 'hour' },
  { limit: 3000, windowMs: DAY, label: 'day' },
];

export class RateLimitError extends Error {
  constructor(message: string, public retryAfterSeconds: number) {
    super(message);
  }
}

// Request timestamps within the last day, keyed by bucket and user (or "global")
const history = new Map<string, number[]>();
let callsSinceCleanup = 0;

function formatWait(seconds: number): string {
  if (seconds < 90) return `${seconds} seconds`;
  if (seconds < 90 * 60) return `${Math.ceil(seconds / 60)} minutes`;
  return `${Math.ceil(seconds / 3600)} hours`;
}

function recentHits(key: string, now: number): number[] {
  const hits = (history.get(key) ?? []).filter((t) => t > now - DAY);
  history.set(key, hits);
  return hits;
}

function removeIdleKeys(now: number) {
  for (const [key, hits] of history) {
    if (!hits.some((t) => t > now - DAY)) history.delete(key);
  }
}

// Records one use of a feature, or throws RateLimitError if a limit has been reached
export function consumeLimit(bucket: LimitBucket, uid: string): void {
  const now = Date.now();
  if (++callsSinceCleanup >= 1000) {
    callsSinceCleanup = 0;
    removeIdleKeys(now);
  }

  const rule = LIMITS[bucket];
  const checks = [
    ...rule.perUser.map((window) => ({ key: `${bucket}:${uid}`, window, scope: 'user' as const })),
    ...(rule.gemini ? GLOBAL_LIMITS.map((window) => ({ key: 'global', window, scope: 'global' as const })) : []),
  ];

  for (const { key, window, scope } of checks) {
    const inWindow = recentHits(key, now).filter((t) => t > now - window.windowMs);
    if (inWindow.length >= window.limit) {
      const retryAfter = Math.max(1, Math.ceil((inWindow[0] + window.windowMs - now) / 1000));
      const message =
        scope === 'user'
          ? `You have reached the limit of ${window.limit} ${rule.noun} per ${window.label}. Try again in ${formatWait(retryAfter)}.`
          : `The console has reached its overall AI usage limit for this ${window.label}. Try again in ${formatWait(retryAfter)}.`;
      throw new RateLimitError(message, retryAfter);
    }
  }

  history.get(`${bucket}:${uid}`)!.push(now);
  if (rule.gemini) history.get('global')!.push(now);
}
