import type { TicketOption } from '../../game/types';

interface DecisionTicketProps {
  kind: 'decision' | 'quiz';
  prompt?: string;
  options?: TicketOption[];
  onResolve: (success: boolean, resultText: string) => void;
}

export function DecisionTicket({ kind, prompt, options, onResolve }: DecisionTicketProps) {
  if (!options) return null;

  return (
    <>
      <p className="ticket-item__prompt">{prompt}</p>
      <div className={kind === 'quiz' ? 'ticket-item__quiz-options' : 'ticket-item__options'}>
        {options.map((option, i) => (
          <button
            key={i}
            className={kind === 'quiz' ? 'ticket-quiz-btn' : 'ticket-option-btn'}
            onClick={() => onResolve(option.correct, option.feedback)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </>
  );
}
