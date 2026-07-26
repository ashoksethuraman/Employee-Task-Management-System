import type { IncomingHttpHeaders } from 'http';

const REDACTED = '[REDACTED]';
const MAX_STRING_LENGTH = 2000;

const SENSITIVE_KEYS = new Set([
  'password',
  'pass',
  'pwd',
  'secret',
  'token',
  'accesstoken',
  'refreshtoken',
  'authorization',
  'cookie',
  'set-cookie',
  'apikey',
  'api-key',
  'clientsecret',
  'privatekey'
]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isSensitiveKey(key: string): boolean {
  const normalized = key.toLowerCase().replace(/[\s_-]/g, '');
  return SENSITIVE_KEYS.has(key.toLowerCase()) || SENSITIVE_KEYS.has(normalized);
}

function sanitizeString(value: string): string {
  if (value.length <= MAX_STRING_LENGTH) {
    return value;
  }

  return `${value.slice(0, MAX_STRING_LENGTH)}...[TRUNCATED]`;
}

function tryParseJsonString(value: string): unknown {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  const first = trimmed[0];
  if (first !== '{' && first !== '[') {
    return undefined;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return undefined;
  }
}

function sanitizeValueInternal(value: unknown, seen: WeakSet<object>): unknown {
  if (value == null) {
    return value;
  }

  if (typeof value === 'string') {
    const parsedJson = tryParseJsonString(value);
    if (parsedJson !== undefined) {
      return sanitizeValueInternal(parsedJson, seen);
    }

    return sanitizeString(value);
  }

  if (typeof value !== 'object') {
    return value;
  }

  if (seen.has(value)) {
    return '[Circular]';
  }

  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValueInternal(item, seen));
  }

  if (!isPlainObject(value)) {
    return String(value);
  }

  const output: Record<string, unknown> = {};

  for (const [key, nested] of Object.entries(value)) {
    if (isSensitiveKey(key)) {
      output[key] = REDACTED;
      continue;
    }

    output[key] = sanitizeValueInternal(nested, seen);
  }

  return output;
}

export function sanitizeValue(value: unknown): unknown {
  return sanitizeValueInternal(value, new WeakSet<object>());
}

export function sanitizeHeaders(headers: IncomingHttpHeaders): Record<string, unknown> {
  const safeHeaders: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(headers)) {
    if (isSensitiveKey(key)) {
      safeHeaders[key] = REDACTED;
      continue;
    }

    safeHeaders[key] = sanitizeValue(value);
  }

  return safeHeaders;
}
