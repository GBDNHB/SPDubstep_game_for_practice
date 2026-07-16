interface ChoreTicketProps {
  done: boolean;
  onToggle: () => void;
}

export function ChoreTicket({ done, onToggle }: ChoreTicketProps) {
  return (
    <div className="ticket-item__row">
      <button className="ticket-item__btn" onClick={onToggle}>
        {done ? 'Отменить' : 'Выполнить'}
      </button>
    </div>
  );
}
