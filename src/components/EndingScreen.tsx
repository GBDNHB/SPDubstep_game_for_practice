import type { EndingConfig } from '../game/endings';

interface EndingScreenProps {
  ending: EndingConfig;
  onRestart: () => void;
}

export function EndingScreen({ ending, onRestart }: EndingScreenProps) {
  return (
    <div className={`ending-screen ending-screen--${ending.tone}`}>
      <div className="ending-card">
        {ending.tone === 'danger' && (
          <div className="ransomware-banner">Все ваши файлы зашифрованы</div>
        )}
        <div className="ending-title">{ending.title}</div>
        <p className="ending-text">{ending.text}</p>
        <button className="btn btn-primary" onClick={onRestart}>
          Играть заново
        </button>
      </div>
    </div>
  );
}
