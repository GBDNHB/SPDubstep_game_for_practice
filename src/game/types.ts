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
