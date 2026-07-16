import { useState } from 'react';
import type { PasswordChip } from '../../game/types';

interface PasswordTicketProps {
  prompt?: string;
  chips?: PasswordChip[];
  onResolve: (success: boolean, resultText: string) => void;
}

const TIERS = [
  { min: -Infinity, label: 'Слабый', className: 'password-meter__fill--weak', ratio: 0.2 },
  { min: 1, label: 'Средний', className: 'password-meter__fill--medium', ratio: 0.5 },
  { min: 3, label: 'Сильный', className: 'password-meter__fill--strong', ratio: 0.8 },
  { min: 4, label: 'Очень сильный', className: 'password-meter__fill--very-strong', ratio: 1 },
];

function getTier(score: number) {
  return [...TIERS].reverse().find((t) => score >= t.min) ?? TIERS[0];
}

export function PasswordTicket({ prompt, chips, onResolve }: PasswordTicketProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  if (!chips) return null;

  function toggleChip(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const score = chips.reduce((sum, chip) => (selected.has(chip.id) ? sum + (chip.good ? 1 : -1) : sum), 0);
  const hasBadSelected = chips.some((c) => !c.good && selected.has(c.id));
  const tier = getTier(score);

  function handleSubmit() {
    const success = (tier.label === 'Сильный' || tier.label === 'Очень сильный') && !hasBadSelected;
    const resultText = success
      ? 'Пароль отвечает политике надёжности ИБ.'
      : 'Пароль недостаточно надёжен — в нём есть уязвимые элементы или не хватает сложности.';
    onResolve(success, resultText);
  }

  return (
    <>
      <p className="ticket-item__prompt">{prompt}</p>
      <div className="password-chips">
        {chips.map((chip) => (
          <button
            key={chip.id}
            className={`password-chip${selected.has(chip.id) ? ' password-chip--selected' : ''}`}
            onClick={() => toggleChip(chip.id)}
          >
            {chip.label}
          </button>
        ))}
      </div>
      <div className="password-meter">
        <div className="password-meter__track">
          <div
            className={`password-meter__fill ${tier.className}`}
            style={{ width: `${tier.ratio * 100}%` }}
          />
        </div>
        <span className="password-meter__label">{tier.label}</span>
      </div>
      <div className="ticket-item__row">
        <button className="ticket-item__btn" onClick={handleSubmit}>
          Утвердить пароль
        </button>
      </div>
    </>
  );
}
