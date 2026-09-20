import { createHash } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

export function stableStringify(value) {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  const entries = Object.entries(value)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, nestedValue]) => `${JSON.stringify(key)}:${stableStringify(nestedValue)}`);

  return `{${entries.join(',')}}`;
}

export function sha256Hex(value) {
  return createHash('sha256').update(value).digest('hex');
}

export async function ensureDir(directoryPath) {
  await mkdir(directoryPath, { recursive: true });
}

export function timestampForFile(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, '-');
}

export function sanitizeFileComponent(value) {
  return String(value).replace(/[^a-zA-Z0-9._-]+/g, '-');
}

export function getNestedValue(record, sourcePath) {
  return sourcePath.split('.').reduce((currentValue, key) => currentValue?.[key], record);
}

export function toRichTextString(value) {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  return JSON.stringify(value);
}

export function asArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value === null || value === undefined || value === '') {
    return [];
  }

  return [value];
}

export function resolvePathFromRepoRoot(repoRoot, relativePath) {
  return path.resolve(repoRoot, relativePath);
}
