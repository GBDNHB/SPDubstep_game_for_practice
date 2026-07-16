import type { Card } from '../game/types';

interface FeedbackProps {
  card: Card;
  isCorrect: boolean;
  securityDelta: number;
  productivityDelta: number;
}

export function Feedback({ card, isCorrect, securityDelta, productivityDelta }: FeedbackProps) {
  const effectParts: string[] = [];
  if (securityDelta !== 0) effectParts.push(`Безопасность ${securityDelta}`);
  if (productivityDelta !== 0) effectParts.push(`Продуктивность ${productivityDelta}`);

  return (
    <div className={`feedback-toast ${isCorrect ? 'feedback-toast--correct' : 'feedback-toast--wrong'}`}>
      <span className="feedback-toast__title">
        {isCorrect ? 'Верно' : 'Ошибка'}
        {effectParts.length > 0 ? ` — ${effectParts.join(', ')}` : ''}
      </span>
      {card.explanation && <span className="feedback-toast__explanation">{card.explanation}</span>}
    </div>
  );
}
