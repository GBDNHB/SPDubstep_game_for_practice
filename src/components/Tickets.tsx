import type { Ticket } from '../game/types';
import { TICKET_MISTAKE_PENALTY } from '../game/logic';
import { ChoreTicket } from './tickets/ChoreTicket';
import { DecisionTicket } from './tickets/DecisionTicket';
import { PasswordTicket } from './tickets/PasswordTicket';
import { SequenceTicket } from './tickets/SequenceTicket';
import { LogScanTicket } from './tickets/LogScanTicket';

interface TicketsProps {
  tickets: Ticket[];
  onToggleChore: (id: string) => void;
  onResolve: (id: string, success: boolean, resultText: string) => void;
}

export function Tickets({ tickets, onToggleChore, onResolve }: TicketsProps) {
  return (
    <div className="ticket-list">
      <p className="ticket-list__hint">
        Помимо почты в очереди служебные тикеты от коллег: рутина, быстрые вопросы и мини-задачи
        по безопасности. Реши каждый до конца дня — иначе продуктивность отдела снизится, а
        неверное решение бьёт по безопасности.
      </p>
      <ul className="ticket-items">
        {tickets.map((ticket) => (
          <li key={ticket.id} className={`ticket-item${ticket.done ? ' ticket-item--done' : ''}`}>
            <div className="ticket-item__title">{ticket.title}</div>

            {ticket.kind === 'chore' && (
              <ChoreTicket done={ticket.done} onToggle={() => onToggleChore(ticket.id)} />
            )}

            {ticket.kind !== 'chore' && ticket.done && (
              <div
                className={`ticket-item__result${
                  ticket.resolvedCorrectly ? ' ticket-item__result--correct' : ' ticket-item__result--wrong'
                }`}
              >
                {ticket.resolvedCorrectly
                  ? 'Решено верно. '
                  : `Решено неверно (Безопасность −${TICKET_MISTAKE_PENALTY}). `}
                {ticket.resultText}
              </div>
            )}

            {(ticket.kind === 'decision' || ticket.kind === 'quiz') && !ticket.done && (
              <DecisionTicket
                kind={ticket.kind}
                prompt={ticket.prompt}
                options={ticket.options}
                onResolve={(success, resultText) => onResolve(ticket.id, success, resultText)}
              />
            )}

            {ticket.kind === 'password' && !ticket.done && (
              <PasswordTicket
                prompt={ticket.prompt}
                chips={ticket.passwordChips}
                onResolve={(success, resultText) => onResolve(ticket.id, success, resultText)}
              />
            )}

            {ticket.kind === 'sequence' && !ticket.done && (
              <SequenceTicket
                prompt={ticket.prompt}
                steps={ticket.steps}
                correctOrder={ticket.correctOrder}
                onResolve={(success, resultText) => onResolve(ticket.id, success, resultText)}
              />
            )}

            {ticket.kind === 'logscan' && !ticket.done && (
              <LogScanTicket
                prompt={ticket.prompt}
                logLines={ticket.logLines}
                onResolve={(success, resultText) => onResolve(ticket.id, success, resultText)}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
