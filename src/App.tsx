import { useEffect, useRef, useState } from 'react';
import { CARDS } from './game/cards';
import { DAYS, getDayConfig, getEndOfDayLine } from './game/days';
import { ENDINGS } from './game/endings';
import {
  applyDecision,
  applyTicketPenalty,
  buildDayDeck,
  checkFinalOutcome,
  checkInstantOutcome,
  clamp,
  TICKET_MISTAKE_PENALTY,
} from './game/logic';
import { pickDailyTickets } from './game/tickets';
import { clearRecords, loadRecords, saveRecord } from './game/records';
import type { Action, Card, GameRecord, Outcome, Ticket } from './game/types';
import { StartScreen } from './components/StartScreen';
import { RulesScreen } from './components/RulesScreen';
import { RecordsScreen } from './components/RecordsScreen';
import { DayIntro } from './components/DayIntro';
import { GameScreen } from './components/GameScreen';
import { PauseMenu } from './components/PauseMenu';
import { DaySummary } from './components/DaySummary';
import { EndingScreen } from './components/EndingScreen';
import type { WorkTab } from './components/TabBar';

type Screen = 'start' | 'rules' | 'records' | 'day-intro' | 'game' | 'day-summary' | 'ending';

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
  const [mistakesTotal, setMistakesTotal] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [ticketsToday, setTicketsToday] = useState<Ticket[]>(() => pickDailyTickets(FIRST_DAY));
  const [activeTab, setActiveTab] = useState<WorkTab>('mail');
  const [paused, setPaused] = useState(false);
  const [records, setRecords] = useState<GameRecord[]>(() => loadRecords());
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordSavedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (screen === 'ending' && outcome && !recordSavedRef.current) {
      recordSavedRef.current = true;
      const record: GameRecord = {
        date: new Date().toISOString(),
        outcome,
        security,
        productivity,
        mistakesTotal,
      };
      setRecords(saveRecord(record));
    }
    if (screen !== 'ending') {
      recordSavedRef.current = false;
    }
  }, [screen, outcome, security, productivity, mistakesTotal]);

  function resetGame() {
    setSecurity(100);
    setProductivity(100);
    setCurrentDay(FIRST_DAY);
    setDeck(initialDeck(FIRST_DAY));
    setIndex(0);
    setMistakesToday(0);
    setMistakesTotal(0);
    setFeedback(null);
    setOutcome(null);
    setTicketsToday(pickDailyTickets(FIRST_DAY));
    setActiveTab('mail');
    setPaused(false);
  }

  function handleStart() {
    resetGame();
    setScreen('day-intro');
  }

  function handleDayIntroContinue() {
    setScreen('game');
  }

  function handleToggleChore(id: string) {
    setTicketsToday((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function handleResolveTicket(id: string, success: boolean, resultText: string) {
    const ticket = ticketsToday.find((t) => t.id === id);
    if (!ticket || ticket.done) return;

    setTicketsToday((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: true, resolvedCorrectly: success, resultText } : t)),
    );

    if (!success) {
      const newSecurity = clamp(security - TICKET_MISTAKE_PENALTY);
      setSecurity(newSecurity);
      setMistakesTotal((m) => m + 1);
      const instant = checkInstantOutcome(newSecurity, productivity);
      if (instant) {
        setOutcome(instant);
        setScreen('ending');
      }
    }
  }

  function handleDecide(action: Action) {
    if (feedback) return;
    const card = deck[index];
    const result = applyDecision(card, action, security, productivity);
    setSecurity(result.security);
    setProductivity(result.productivity);
    if (!result.isCorrect) {
      setMistakesToday((m) => m + 1);
      setMistakesTotal((m) => m + 1);
    }
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
        const unfinished = ticketsToday.filter((t) => !t.done).length;
        const finalProductivity =
          unfinished > 0 ? applyTicketPenalty(result.productivity, unfinished) : result.productivity;
        setProductivity(finalProductivity);
        const dayEndOutcome = checkInstantOutcome(result.security, finalProductivity);
        if (dayEndOutcome) {
          setOutcome(dayEndOutcome);
          setScreen('ending');
          return;
        }
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
    setTicketsToday(pickDailyTickets(nextDay));
    setActiveTab('mail');
    setScreen('day-intro');
  }

  function handleClearRecords() {
    clearRecords();
    setRecords([]);
  }

  const unfinishedTicketsToday = ticketsToday.filter((t) => !t.done).length;

  return (
    <>
      <header className="app-header">
        <div className="app-header__logo">
          Техно<span>Сфера</span> · Почта
        </div>
        {screen === 'game' ? (
          <button className="app-header__pause" onClick={() => setPaused(true)}>
            Пауза
          </button>
        ) : (
          <div className="app-header__role">Отдел ИБ · Стажёр</div>
        )}
      </header>
      <main className="app-main">
        {screen === 'start' && (
          <StartScreen
            onStart={handleStart}
            onShowRules={() => setScreen('rules')}
            onShowRecords={() => setScreen('records')}
          />
        )}

        {screen === 'rules' && <RulesScreen onBack={() => setScreen('start')} />}

        {screen === 'records' && (
          <RecordsScreen
            records={records}
            onBack={() => setScreen('start')}
            onClear={handleClearRecords}
          />
        )}

        {screen === 'day-intro' && (
          <DayIntro dayConfig={getDayConfig(currentDay)} onContinue={handleDayIntroContinue} />
        )}

        {screen === 'game' && deck[index] && (
          <>
            <GameScreen
              card={deck[index]}
              weekday={getDayConfig(currentDay).weekday}
              index={index}
              total={deck.length}
              security={security}
              productivity={productivity}
              feedback={feedback}
              onDecide={handleDecide}
              tickets={ticketsToday}
              onToggleChore={handleToggleChore}
              onResolveTicket={handleResolveTicket}
              activeTab={activeTab}
              onChangeTab={setActiveTab}
              paused={paused}
            />
            {paused && (
              <PauseMenu
                security={security}
                productivity={productivity}
                weekday={getDayConfig(currentDay).weekday}
                onResume={() => setPaused(false)}
                onQuitToMenu={() => {
                  setPaused(false);
                  setScreen('start');
                }}
              />
            )}
          </>
        )}

        {screen === 'day-summary' && (
          <DaySummary
            weekday={getDayConfig(currentDay).weekday}
            totalCards={deck.length}
            mistakes={mistakesToday}
            security={security}
            productivity={productivity}
            unfinishedTickets={unfinishedTicketsToday}
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
