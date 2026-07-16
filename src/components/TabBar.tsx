export type WorkTab = 'mail' | 'tickets';

interface TabBarProps {
  active: WorkTab;
  mailRemaining: number;
  ticketsPending: number;
  onChange: (tab: WorkTab) => void;
}

export function TabBar({ active, mailRemaining, ticketsPending, onChange }: TabBarProps) {
  return (
    <div className="tab-bar">
      <button
        className={`tab-btn${active === 'mail' ? ' tab-btn--active' : ''}`}
        onClick={() => onChange('mail')}
      >
        Почта
        {mailRemaining > 0 && <span className="tab-badge">{mailRemaining}</span>}
      </button>
      <button
        className={`tab-btn${active === 'tickets' ? ' tab-btn--active' : ''}`}
        onClick={() => onChange('tickets')}
      >
        Тикеты
        {ticketsPending > 0 && <span className="tab-badge tab-badge--warning">{ticketsPending}</span>}
      </button>
    </div>
  );
}
