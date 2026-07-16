import { useEffect, useRef, useState } from 'react';
import type { Action, Card, Ticket } from '../game/types';
import { Hud } from './Hud';
import { MailCard, type MailCardHandle } from './MailCard';
import { Feedback } from './Feedback';
import { TabBar, type WorkTab } from './TabBar';
import { Tickets } from './Tickets';

const FRIDAY_TIMER_SECONDS = 15;

interface GameScreenProps {
  card: Card;
  weekday: string;
  index: number;
  total: number;
  security: number;
  productivity: number;
  feedback: { action: Action; isCorrect: boolean; securityDelta: number; productivityDelta: number } | null;
  onDecide: (action: Action) => void;
  tickets: Ticket[];
  onToggleChore: (id: string) => void;
  onResolveTicket: (id: string, success: boolean, resultText: string) => void;
  activeTab: WorkTab;
  onChangeTab: (tab: WorkTab) => void;
  paused: boolean;
}

export function GameScreen({
  card,
  weekday,
  index,
  total,
  security,
  productivity,
  feedback,
  onDecide,
  tickets,
  onToggleChore,
  onResolveTicket,
  activeTab,
  onChangeTab,
  paused,
}: GameScreenProps) {
  const cardRef = useRef<MailCardHandle>(null);
  const locked = feedback !== null;
  const isFriday = card.day === 5;
  const [timeLeft, setTimeLeft] = useState(FRIDAY_TIMER_SECONDS);

  useEffect(() => {
    setTimeLeft(FRIDAY_TIMER_SECONDS);
  }, [card.id]);

  useEffect(() => {
    if (!isFriday || locked || paused) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        const next = t - 0.1;
        if (next <= 0) {
          clearInterval(interval);
          cardRef.current?.decide('pass');
          return 0;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [card.id, isFriday, locked, paused]);

  function handleButtonClick(action: Action) {
    if (locked) return;
    cardRef.current?.decide(action);
  }

  const timerRatio = Math.max(0, timeLeft / FRIDAY_TIMER_SECONDS);
  const pendingTickets = tickets.filter((t) => !t.done).length;

  return (
    <div className="app-container">
      <Hud
        security={security}
        productivity={productivity}
        weekday={weekday}
        index={index + 1}
        total={total}
      />
      <TabBar
        active={activeTab}
        mailRemaining={total - index}
        ticketsPending={pendingTickets}
        onChange={onChangeTab}
      />

      <div style={{ display: activeTab === 'mail' ? 'flex' : 'none', flexDirection: 'column', gap: 16 }}>
        {isFriday && (
          <div className="friday-timer">
            <div
              className={`friday-timer__fill${timerRatio < 0.3 ? ' friday-timer__fill--critical' : ''}`}
              style={{ width: `${timerRatio * 100}%` }}
            />
          </div>
        )}
        <div className="card-stack">
          <MailCard key={card.id} ref={cardRef} card={card} onDecide={onDecide} />
        </div>
        {feedback && (
          <Feedback
            card={card}
            isCorrect={feedback.isCorrect}
            securityDelta={feedback.securityDelta}
            productivityDelta={feedback.productivityDelta}
          />
        )}
        <div className="action-bar">
          <button
            className="action-btn action-btn--quarantine"
            disabled={locked}
            onClick={() => handleButtonClick('quarantine')}
          >
            В карантин
          </button>
          <button
            className="action-btn action-btn--pass"
            disabled={locked}
            onClick={() => handleButtonClick('pass')}
          >
            Пропустить
          </button>
        </div>
      </div>

      <div style={{ display: activeTab === 'tickets' ? 'block' : 'none' }}>
        <Tickets tickets={tickets} onToggleChore={onToggleChore} onResolve={onResolveTicket} />
      </div>
    </div>
  );
}
