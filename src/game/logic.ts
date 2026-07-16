import type { Action, Card, Outcome } from './types';

/** Штраф за одну ошибку. Вынесен в константу для настройки баланса. */
export const PENALTY = 10;
export const WIN_THRESHOLD = 70;
/** Штраф продуктивности за один незакрытый до конца дня тикет. */
export const TICKET_PENALTY = 5;
/** Штраф безопасности за неверно разрешённый тикет-решение. */
export const TICKET_MISTAKE_PENALTY = 5;

export function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function buildDayDeck(cards: Card[], day: Card['day']): Card[] {
  return shuffle(cards.filter((c) => c.day === day));
}

export interface DecisionResult {
  isCorrect: boolean;
  security: number;
  productivity: number;
  securityDelta: number;
  productivityDelta: number;
}

/** Применяет решение игрока к текущим шкалам согласно таблице из раздела 8. */
export function applyDecision(
  card: Card,
  action: Action,
  security: number,
  productivity: number,
): DecisionResult {
  const isCorrect = action === card.correct;
  let securityDelta = 0;
  let productivityDelta = 0;

  if (!isCorrect) {
    if (card.type === 'phishing' && action === 'pass') {
      securityDelta = -PENALTY;
    } else if (card.type === 'safe' && action === 'quarantine') {
      productivityDelta = -PENALTY;
    }
  }

  return {
    isCorrect,
    security: clamp(security + securityDelta),
    productivity: clamp(productivity + productivityDelta),
    securityDelta,
    productivityDelta,
  };
}

/** Проверка мгновенного поражения после каждого решения. */
export function checkInstantOutcome(security: number, productivity: number): Outcome | null {
  if (security <= 0) return 'lose_security';
  if (productivity <= 0) return 'lose_productivity';
  return null;
}

/** Проверка итога недели — вызывается один раз после последнего письма пятницы. */
export function checkFinalOutcome(security: number, productivity: number): Outcome {
  if (security > WIN_THRESHOLD && productivity > WIN_THRESHOLD) return 'win';
  return 'neutral';
}

/** Штраф продуктивности за незакрытые к концу дня тикеты. */
export function applyTicketPenalty(productivity: number, unfinishedCount: number): number {
  return clamp(productivity - unfinishedCount * TICKET_PENALTY);
}
