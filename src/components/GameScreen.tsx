import { useRef } from 'react';
import type { Action, Card } from '../game/types';
import { Hud } from './Hud';
import { MailCard, type MailCardHandle } from './MailCard';
import { Feedback } from './Feedback';

interface GameScreenProps {
  card: Card;
  weekday: string;
  index: number;
  total: number;
  security: number;
  productivity: number;
  feedback: { action: Action; isCorrect: boolean; securityDelta: number; productivityDelta: number } | null;
  onDecide: (action: Action) => void;
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
}: GameScreenProps) {
  const cardRef = useRef<MailCardHandle>(null);
  const locked = feedback !== null;

  function handleButtonClick(action: Action) {
    if (locked) return;
    cardRef.current?.decide(action);
  }

  return (
    <div className="app-container">
      <Hud
        security={security}
        productivity={productivity}
        weekday={weekday}
        index={index + 1}
        total={total}
      />
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
  );
}
