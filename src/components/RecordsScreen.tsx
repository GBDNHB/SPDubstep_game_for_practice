import type { GameRecord } from '../game/types';
import { ENDINGS } from '../game/endings';

interface RecordsScreenProps {
  records: GameRecord[];
  onBack: () => void;
  onClear: () => void;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function RecordsScreen({ records, onBack, onClear }: RecordsScreenProps) {
  return (
    <div className="screen-centered">
      <div className="info-card">
        <h2>Рекорды</h2>
        {records.length === 0 ? (
          <p>Здесь появится история твоих смен, как только пройдёшь неделю до конца.</p>
        ) : (
          <ul className="records-list">
            {records.map((record, i) => (
              <li key={i} className="record-item">
                <div className="record-item__top">
                  <span className={`record-badge record-badge--${ENDINGS[record.outcome].tone}`}>
                    {ENDINGS[record.outcome].title}
                  </span>
                  <span className="record-item__date">{formatDate(record.date)}</span>
                </div>
                <div className="record-item__stats">
                  <span>Безопасность: {record.security}%</span>
                  <span>Продуктивность: {record.productivity}%</span>
                  <span>Ошибок за неделю: {record.mistakesTotal}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="info-card__actions">
          <button className="btn btn-primary" onClick={onBack}>
            Назад
          </button>
          {records.length > 0 && (
            <button className="btn btn-secondary" onClick={onClear}>
              Очистить историю
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
