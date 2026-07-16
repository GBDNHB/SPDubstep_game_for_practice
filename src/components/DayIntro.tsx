import type { DayConfig } from '../game/types';

interface DayIntroProps {
  dayConfig: DayConfig;
  onContinue: () => void;
}

export function DayIntro({ dayConfig, onContinue }: DayIntroProps) {
  const isVitaly = dayConfig.introSpeaker === 'Виталий';

  return (
    <div className="screen-centered">
      <div className="day-intro">
        <div className="day-intro__badge">{dayConfig.weekday}</div>
        <h2>{dayConfig.title}</h2>
        <p className="day-intro__goal">Цель дня: {dayConfig.goal}</p>
        <div className="speaker-bubble">
          <div className={`speaker-avatar${isVitaly ? ' speaker-avatar--vitaly' : ''}`}>
            {isVitaly ? 'В' : 'А'}
          </div>
          <div>
            <div className="speaker-name">{dayConfig.introSpeaker}</div>
            <div className="speaker-text">«{dayConfig.introText}»</div>
          </div>
        </div>
        <button className="btn btn-primary" onClick={onContinue}>
          К письмам
        </button>
      </div>
    </div>
  );
}
