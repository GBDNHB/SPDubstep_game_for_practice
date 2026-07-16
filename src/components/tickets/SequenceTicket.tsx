import { useState } from 'react';
import type { SequenceStep } from '../../game/types';

interface SequenceTicketProps {
  prompt?: string;
  steps?: SequenceStep[];
  correctOrder?: string[];
  onResolve: (success: boolean, resultText: string) => void;
}

export function SequenceTicket({ prompt, steps, correctOrder, onResolve }: SequenceTicketProps) {
  const [chosen, setChosen] = useState<string[]>([]);

  if (!steps || !correctOrder) return null;

  function pick(id: string) {
    if (chosen.includes(id)) return;
    setChosen((prev) => [...prev, id]);
  }

  function reset() {
    setChosen([]);
  }

  function confirm() {
    const success = chosen.length === correctOrder!.length && chosen.every((id, i) => id === correctOrder![i]);
    const correctText = correctOrder!
      .map((id, i) => `${i + 1}. ${steps!.find((s) => s.id === id)?.text}`)
      .join(' ');
    const resultText = success
      ? 'Верно, порядок действий восстановлен правильно.'
      : `Порядок был другим. Правильно: ${correctText}`;
    onResolve(success, resultText);
  }

  const remaining = steps.filter((s) => !chosen.includes(s.id));

  return (
    <>
      <p className="ticket-item__prompt">{prompt}</p>
      <ol className="sequence-chosen">
        {chosen.map((id, i) => (
          <li key={id}>
            <span className="sequence-chosen__index">{i + 1}</span>
            {steps.find((s) => s.id === id)?.text}
          </li>
        ))}
      </ol>
      {remaining.length > 0 && (
        <div className="sequence-options">
          {remaining.map((step) => (
            <button key={step.id} className="sequence-option-btn" onClick={() => pick(step.id)}>
              {step.text}
            </button>
          ))}
        </div>
      )}
      {chosen.length === steps.length && (
        <div className="ticket-item__row ticket-item__row--split">
          <button className="btn-secondary sequence-reset-btn" onClick={reset}>
            Сбросить
          </button>
          <button className="ticket-item__btn" onClick={confirm}>
            Подтвердить порядок
          </button>
        </div>
      )}
    </>
  );
}
