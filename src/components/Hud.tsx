interface HudProps {
  security: number;
  productivity: number;
  weekday: string;
  index: number; // текущее письмо (1-based)
  total: number;
}

function barClass(value: number): string {
  if (value > 60) return 'hud-bar__fill--good';
  if (value > 30) return 'hud-bar__fill--mid';
  return 'hud-bar__fill--bad';
}

export function Hud({ security, productivity, weekday, index, total }: HudProps) {
  return (
    <div className="hud">
      <div className="hud__top">
        <span>{weekday}</span>
        <span>
          Писем: {Math.min(index, total)}/{total}
        </span>
      </div>
      <div className="hud__bars">
        <div className="hud-bar">
          <span className="hud-bar__label">Безопасность</span>
          <div className="hud-bar__track">
            <div
              className={`hud-bar__fill ${barClass(security)}`}
              style={{ width: `${security}%` }}
            />
          </div>
          <span className="hud-bar__value">{security}%</span>
        </div>
        <div className="hud-bar">
          <span className="hud-bar__label">Продуктивность</span>
          <div className="hud-bar__track">
            <div
              className={`hud-bar__fill ${barClass(productivity)}`}
              style={{ width: `${productivity}%` }}
            />
          </div>
          <span className="hud-bar__value">{productivity}%</span>
        </div>
      </div>
    </div>
  );
}
