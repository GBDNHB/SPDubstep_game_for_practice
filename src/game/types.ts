export type CardType = 'safe' | 'phishing';
export type Action = 'pass' | 'quarantine'; // pass = свайп вправо; quarantine = свайп влево

export interface Card {
  id: string;            // напр. "1.1"
  day: 1 | 2 | 3 | 4 | 5;
  type: CardType;
  sender: string;        // e-mail отправителя (показывать дословно, домен важен)
  subject: string;       // тема письма
  body: string;          // текст письма
  attachment: string | null; // имя файла с расширением, либо null
  correct: Action;       // safe → 'pass', phishing → 'quarantine'
  explanation: string | null; // «Пояснение» из сценария, где задано
}

export interface DayConfig {
  day: 1 | 2 | 3 | 4 | 5;
  weekday: string;       // "Понедельник" ...
  title: string;         // "Базовый уровень" ...
  goal: string;
  introSpeaker: 'Анна Сергеевна' | 'Виталий';
  introText: string;
}

export type Outcome =
  | 'win'                 // концовка 1
  | 'lose_security'       // концовка 2
  | 'lose_productivity'   // концовка 3
  | 'neutral';            // концовка 4 (граничный случай)

export interface GameState {
  security: number;       // 0..100, старт 100
  productivity: number;   // 0..100, старт 100
  currentDay: 1 | 2 | 3 | 4 | 5;
  queue: Card[];          // перемешанная колода текущего дня
  index: number;          // индекс текущей карточки
  mistakesToday: number;
  finished: boolean;
  outcome: Outcome | null;
}

export type TicketKind = 'chore' | 'decision' | 'quiz' | 'password' | 'sequence' | 'logscan';

/** Вариант ответа: для kind === 'decision' | 'quiz'. */
export interface TicketOption {
  label: string;
  correct: boolean;
  feedback: string;
}

/** Переключаемый «ингредиент» пароля в мини-игре password. */
export interface PasswordChip {
  id: string;
  label: string;
  good: boolean; // повышает или снижает надёжность
}

/** Один шаг реагирования на инцидент в мини-игре sequence (предъявляется вперемешку). */
export interface SequenceStep {
  id: string;
  text: string;
}

/** Строка лога в мини-игре logscan. */
export interface LogLine {
  id: string;
  text: string;
  suspicious: boolean;
}

/**
 * Служебный тикет отдела ИБ — параллельно с разбором почты стажёру приходят
 * заявки от коллег и внутренние мини-задачи:
 * - 'chore' — обычная рутина, просто отметить выполненной;
 * - 'decision' — короткий сценарий с выбором решения по политике ИБ;
 * - 'quiz' — быстрый вопрос «верно/неверно»;
 * - 'password' — собрать пароль, отвечающий политике надёжности;
 * - 'sequence' — восстановить правильный порядок действий при инциденте;
 * - 'logscan' — найти подозрительную запись среди строк лога.
 */
export interface Ticket {
  id: string;
  kind: TicketKind;
  title: string;
  done: boolean;
  resolvedCorrectly?: boolean;
  resultText?: string; // итоговое пояснение после решения (кроме chore)

  // decision & quiz
  prompt?: string;
  options?: TicketOption[];

  // password
  passwordChips?: PasswordChip[];

  // sequence
  steps?: SequenceStep[];      // шаги в перемешанном порядке для отображения
  correctOrder?: string[];    // id шагов в правильном порядке

  // logscan
  logLines?: LogLine[];
}

/** Одна завершённая партия — хранится в localStorage для экрана «Рекорды». */
export interface GameRecord {
  date: string; // ISO-строка
  outcome: Outcome;
  security: number;
  productivity: number;
  mistakesTotal: number;
}
