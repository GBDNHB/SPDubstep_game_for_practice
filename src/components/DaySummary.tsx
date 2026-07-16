import { TICKET_PENALTY } from '../game/logic';

interface DaySummaryProps {
  weekday: string;
  totalCards: number;
  mistakes: number;
  security: number;
  productivity: number;
  unfinishedTickets: number;
  annaLine: string;
  isLastDay: boolean;
  onContinue: () => void;
}

export function DaySummary({
  weekday,
  totalCards,
  mistakes,
  security,
  productivity,
  unfinishedTickets,
  annaLine,
  isLastDay,
  onContinue,
}: DaySummaryProps) {
  return (
    <div className="screen-centered">
      <div className="day-summary">
        <h2>Итог дня: {weekday}</h2>
        <div className="day-summary__stats">
          <div className="stat-tile">
            <div className="stat-tile__label">Писем разобрано</div>
            <div className="stat-tile__value">{totalCards}</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile__label">Ошибок</div>
            <div className="stat-tile__value">{mistakes}</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile__label">Безопасность</div>
            <div className="stat-tile__value">{security}%</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile__label">Продуктивность</div>
            <div className="stat-tile__value">{productivity}%</div>
          </div>
        </div>
        {unfinishedTickets > 0 && (
          <p className="day-summary__note">
            Незакрытых тикетов: {unfinishedTickets} (продуктивность −{unfinishedTickets * TICKET_PENALTY}%)
          </p>
        )}
        <div className="speaker-bubble">
          <div className="speaker-avatar">А</div>
          <div>
            <div className="speaker-name">Анна Сергеевна</div>
            <div className="speaker-text">«{annaLine}»</div>
          </div>
        </div>
        <button className="btn btn-primary" onClick={onContinue}>
          {isLastDay ? 'Домой на выходные' : 'Следующий день'}
        </button>
      </div>
    </div>
  );
}
