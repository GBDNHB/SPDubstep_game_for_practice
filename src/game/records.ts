import type { GameRecord } from './types';

const STORAGE_KEY = 'inspector-vhodyaschih:records';
const MAX_RECORDS = 20;

export function loadRecords(): GameRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as GameRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveRecord(record: GameRecord): GameRecord[] {
  const records = [record, ...loadRecords()].slice(0, MAX_RECORDS);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // localStorage недоступен (приватный режим и т.п.) — пропускаем сохранение
  }
  return records;
}

export function clearRecords(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
