import type { LogLine } from '../../game/types';

interface LogScanTicketProps {
  prompt?: string;
  logLines?: LogLine[];
  onResolve: (success: boolean, resultText: string) => void;
}

export function LogScanTicket({ prompt, logLines, onResolve }: LogScanTicketProps) {
  if (!logLines) return null;

  function handlePick(line: LogLine) {
    if (line.suspicious) {
      onResolve(true, 'Верно, эта запись подозрительна.');
      return;
    }
    const actual = logLines!.find((l) => l.suspicious);
    onResolve(false, `Это обычная запись. Настоящая аномалия: «${actual?.text}».`);
  }

  return (
    <>
      <p className="ticket-item__prompt">{prompt}</p>
      <div className="log-lines">
        {logLines.map((line) => (
          <button key={line.id} className="log-line mono" onClick={() => handlePick(line)}>
            {line.text}
          </button>
        ))}
      </div>
    </>
  );
}
