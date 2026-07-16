interface PauseMenuProps {
  security: number;
  productivity: number;
  weekday: string;
  onResume: () => void;
  onQuitToMenu: () => void;
}

export function PauseMenu({ security, productivity, weekday, onResume, onQuitToMenu }: PauseMenuProps) {
  return (
    <div className="pause-overlay">
      <div className="pause-card">
        <h2>Пауза</h2>
        <p className="pause-card__day">{weekday}</p>
        <div className="pause-card__stats">
          <span>Безопасность: {security}%</span>
          <span>Продуктивность: {productivity}%</span>
        </div>
        <button className="btn btn-primary" onClick={onResume}>
          Продолжить смену
        </button>
        <button className="btn btn-secondary" onClick={onQuitToMenu}>
          Выйти в главное меню
        </button>
      </div>
    </div>
  );
}
