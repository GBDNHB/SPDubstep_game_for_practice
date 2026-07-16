import { useEffect, useRef, useState } from 'react';
import { CARDS } from './game/cards';
import { DAYS, getDayConfig, getEndOfDayLine } from './game/days';
import { ENDINGS } from './game/endings';
import { applyDecision, buildDayDeck, checkFinalOutcome, checkInstantOutcome } from './game/logic';
import type { Action, Card, Outcome } from './game/types';
import { StartScreen } from './components/StartScreen';
import { DayIntro } from './components/DayIntro';
import { GameScreen } from './components/GameScreen';
import { DaySummary } from './components/DaySummary';
import { EndingScreen } from './components/EndingScreen';

type Screen = 'start' | 'day-intro' | 'game' | 'day-summary' | 'ending';

interface FeedbackState {
  action: Action;
  isCorrect: boolean;
  securityDelta: number;
  productivityDelta: number;
}

const FEEDBACK_DELAY_MS = 1400;
const FIRST_DAY = 1 as const;

function initialDeck(day: Card['day']): Card[] {
  return buildDayDeck(CARDS, day);
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('start');
  const [security, setSecurity] = useState(100);
  const [productivity, setProductivity] = useState(100);
  const [currentDay, setCurrentDay] = useState<Card['day']>(FIRST_DAY);
  const [deck, setDeck] = useState<Card[]>(() => initialDeck(FIRST_DAY));
  const [index, setIndex] = useState(0);
  const [mistakesToday, setMistakesToday] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function resetGame() {
    setSecurity(100);
    setProductivity(100);
    setCurrentDay(FIRST_DAY);
    setDeck(initialDeck(FIRST_DAY));
    setIndex(0);
    setMistakesToday(0);
    setFeedback(null);
    setOutcome(null);
  }

  function handleStart() {
    resetGame();
    setScreen('day-intro');
  }

  function handleDayIntroContinue() {
    setScreen('game');
  }

  function handleDecide(action: Action) {
    if (feedback) return;
    const card = deck[index];
    const result = applyDecision(card, action, security, productivity);
    setSecurity(result.security);
    setProductivity(result.productivity);
    if (!result.isCorrect) setMistakesToday((m) => m + 1);
    setFeedback({
      action,
      isCorrect: result.isCorrect,
      securityDelta: result.securityDelta,
      productivityDelta: result.productivityDelta,
    });

    const instant = checkInstantOutcome(result.security, result.productivity);

    timeoutRef.current = setTimeout(() => {
      setFeedback(null);
      if (instant) {
        setOutcome(instant);
        setScreen('ending');
        return;
      }
      const nextIndex = index + 1;
      if (nextIndex >= deck.length) {
        setScreen('day-summary');
      } else {
        setIndex(nextIndex);
      }
    }, FEEDBACK_DELAY_MS);
  }

  function handleDaySummaryContinue() {
    if (currentDay === 5) {
      setOutcome(checkFinalOutcome(security, productivity));
      setScreen('ending');
      return;
    }
    const nextDay = (currentDay + 1) as Card['day'];
    setCurrentDay(nextDay);
    setDeck(initialDeck(nextDay));
    setIndex(0);
    setMistakesToday(0);
    setScreen('day-intro');
  }

  return (
    <>
      <header className="app-header">
        <div className="app-header__logo">
          Техно<span>Сфера</span> · Почта
        </div>
        <div className="app-header__role">Отдел ИБ · Стажёр</div>
      </header>
      <main className="app-main">
        {screen === 'start' && <StartScreen onStart={handleStart} />}

        {screen === 'day-intro' && (
          <DayIntro dayConfig={getDayConfig(currentDay)} onContinue={handleDayIntroContinue} />
        )}

        {screen === 'game' && deck[index] && (
          <GameScreen
            card={deck[index]}
            weekday={getDayConfig(currentDay).weekday}
            index={index}
            total={deck.length}
            security={security}
            productivity={productivity}
            feedback={feedback}
            onDecide={handleDecide}
          />
        )}

        {screen === 'day-summary' && (
          <DaySummary
            weekday={getDayConfig(currentDay).weekday}
            totalCards={deck.length}
            mistakes={mistakesToday}
            security={security}
            productivity={productivity}
            annaLine={getEndOfDayLine(mistakesToday)}
            isLastDay={currentDay === DAYS.length}
            onContinue={handleDaySummaryContinue}
          />
        )}

        {screen === 'ending' && outcome && (
          <EndingScreen ending={ENDINGS[outcome]} onRestart={handleStart} />
        )}
      </main>
      <footer className="app-footer">Игру подготовила команда SPDubstep</footer>
    </>
  );
}
