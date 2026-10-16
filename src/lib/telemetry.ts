'use client';

/**
 * Aurora Telemetry & Comprehensive Cookie Audit Trail Engine
 * Tracks every user action, mode switch, reader event, selection,
 * AI query, network request, touch gesture, and bug into persistent cookies
 * and local storage for runtime diagnostics and activity analysis.
 */

export interface TelemetryEvent {
  event: string;
  category: 'navigation' | 'reader' | 'arena' | 'chat' | 'system' | 'error' | 'security' | 'gesture';
  metadata?: Record<string, any>;
  timestamp: string;
}

export const SESSION_COOKIE_NAME = 'aurora_sid';
export const MODE_COOKIE_NAME = 'aurora_workspace_mode';
export const ACTION_TRAIL_COOKIE_NAME = 'aurora_action_trail';
export const BUG_LOG_COOKIE_NAME = 'aurora_bug_log';
export const ANOMALY_COOKIE_NAME = 'aurora_anomaly_flags';
export const COUNTER_COOKIE_NAME = 'aurora_activity_counter';
const MAX_COOKIE_LOGS = 30;

/**
 * Read cookie by name safely
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

/**
 * Set a cookie with expiration in days
 */
export function setCookie(name: string, value: string, days = 30): void {
  if (typeof document === 'undefined') return;
  try {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  } catch (err) {
    console.warn('[Aurora Telemetry] Cookie write error:', err);
  }
}

/**
 * Ensure an active Aurora session exists
 */
export function initSessionId(): string {
  let sid = getCookie(SESSION_COOKIE_NAME);
  if (!sid) {
    sid = 'aurora_s_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    setCookie(SESSION_COOKIE_NAME, sid, 30);
  }
  return sid;
}

/**
 * Increment activity counter cookie
 */
function incrementCounter(): number {
  const current = parseInt(getCookie(COUNTER_COOKIE_NAME) || '0', 10);
  const next = isNaN(current) ? 1 : current + 1;
  setCookie(COUNTER_COOKIE_NAME, String(next), 30);
  return next;
}

/**
 * Log an action to cookie trail, local storage, and debug output
 */
export function trackAuroraEvent(
  event: string,
  category: TelemetryEvent['category'],
  metadata: Record<string, any> = {}
): void {
  if (typeof window === 'undefined') return;

  const sid = initSessionId();
  const count = incrementCounter();

  const entry: TelemetryEvent = {
    event,
    category,
    metadata: {
      ...metadata,
      sid,
      seq: count,
      path: window.location.pathname,
      url: window.location.search,
    },
    timestamp: new Date().toISOString(),
  };

  try {
    // 1. Maintain rolling list in cookie for lightweight edge/session inspection
    const existingRaw = getCookie(ACTION_TRAIL_COOKIE_NAME);
    let logs: Array<{ e: string; c: string; t: string; d?: any }> = [];
    if (existingRaw) {
      try {
        logs = JSON.parse(existingRaw);
      } catch {}
    }

    // Compact format for cookie footprint: e: event, c: category, t: time, d: details
    logs.push({
      e: entry.event,
      c: entry.category,
      t: entry.timestamp,
      d: metadata && Object.keys(metadata).length > 0 ? metadata : undefined,
    });

    if (logs.length > MAX_COOKIE_LOGS) {
      logs = logs.slice(-MAX_COOKIE_LOGS);
    }

    setCookie(ACTION_TRAIL_COOKIE_NAME, JSON.stringify(logs), 7);

    // 2. Also log full event details to localStorage for deep diagnostics
    const localHistory = JSON.parse(localStorage.getItem('aurora_deep_telemetry') || '[]');
    localHistory.push(entry);
    if (localHistory.length > 200) localHistory.shift();
    localStorage.setItem('aurora_deep_telemetry', JSON.stringify(localHistory));
  } catch (err) {
    console.warn('[Aurora Telemetry] Failed to record event:', err);
  }
}

/**
 * Specialized Tracker for Text Highlight and Reader features
 */
export function trackAuroraReaderAction(
  action: 'explain_more' | 'blend_into_text' | 'quick_lookup' | 'ask_ai' | 'revert_blend' | 'copy_excerpt' | 'highlight' | 'chapter_switch',
  details: {
    courseCode?: string;
    chapterId?: string;
    paragraphIndex?: number;
    snippet?: string;
    targetMode?: string;
  }
): void {
  trackAuroraEvent(`reader_${action}`, 'reader', {
    ...details,
    snippetLength: details.snippet?.length || 0,
    snippetPreview: details.snippet ? details.snippet.slice(0, 50) : undefined,
  });
}

/**
 * Track anomaly or suspicious behavior (floods, devtools, bulk copies, rapid clicks)
 */
export function trackAuroraAnomaly(
  anomalyType: 'bulk_copy_attempt' | 'screenshot_attempt' | 'rapid_click_flood' | 'api_failure' | 'navigation_loop',
  details: Record<string, any> = {}
): void {
  try {
    const rawAnomalies = getCookie(ANOMALY_COOKIE_NAME);
    let anomalyList: string[] = [];
    if (rawAnomalies) {
      try {
        anomalyList = JSON.parse(rawAnomalies);
      } catch {}
    }

    anomalyList.push(`${anomalyType}_${Date.now()}`);
    if (anomalyList.length > 10) anomalyList.shift();
    setCookie(ANOMALY_COOKIE_NAME, JSON.stringify(anomalyList), 7);
  } catch {}

  trackAuroraEvent(`security_${anomalyType}`, 'security', details);
}

/**
 * Track workspace mode in cookie
 */
export function setWorkspaceModeCookie(mode: 'academic' | 'arena'): void {
  setCookie(MODE_COOKIE_NAME, mode, 60);
  trackAuroraEvent('workspace_mode_changed', 'navigation', { mode });
}

export function getWorkspaceModeCookie(): 'academic' | 'arena' {
  const mode = getCookie(MODE_COOKIE_NAME);
  return mode === 'arena' ? 'arena' : 'academic';
}

/**
 * Automatic listeners for client unhandled errors, network drops & print protection
 */
if (typeof window !== 'undefined') {
  // Capture unhandled errors and log to bug cookie
  window.addEventListener('error', (event) => {
    const bugInfo = {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      time: new Date().toISOString(),
    };
    trackAuroraEvent('client_unhandled_error', 'error', bugInfo);

    try {
      const rawBugs = getCookie(BUG_LOG_COOKIE_NAME);
      let bugs: any[] = [];
      if (rawBugs) {
        try { bugs = JSON.parse(rawBugs); } catch {}
      }
      bugs.push(bugInfo);
      if (bugs.length > 5) bugs.shift();
      setCookie(BUG_LOG_COOKIE_NAME, JSON.stringify(bugs), 3);
    } catch {}
  });

  window.addEventListener('unhandledrejection', (event) => {
    trackAuroraEvent('unhandled_promise_rejection', 'error', {
      reason: String(event.reason),
    });
  });

  // Track online/offline network transitions
  window.addEventListener('offline', () => {
    trackAuroraEvent('network_disconnected', 'system', { online: false });
  });

  window.addEventListener('online', () => {
    trackAuroraEvent('network_restored', 'system', { online: true });
  });

  window.addEventListener('keyup', (e: KeyboardEvent) => {
    if (e.key === 'PrintScreen') {
      trackAuroraAnomaly('screenshot_attempt', { key: 'PrintScreen' });
    }
  });
}
