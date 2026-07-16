interface StartScreenProps {
  onStart: () => void;
  onShowRules: () => void;
  onShowRecords: () => void;
}

export function StartScreen({ onStart, onShowRules, onShowRecords }: StartScreenProps) {
  return (
    <div className="screen-centered">
      <div className="start-card">
        <div className="start-card__eyebrow">ТехноСфера · Отдел информационной безопасности</div>
        <h1>Инспектор входящих</h1>
        <p>
          Ты — младший стажёр отдела ИБ. Впереди рабочая неделя: разбирай входящую почту,
          отправляй фишинговые письма в карантин и пропускай легитимные рабочие сообщения.
          Одна невнимательность — и компания заплатит за это.
        </p>
        <div className="start-card__menu">
          <button className="btn btn-primary" onClick={onStart}>
            Начать смену
          </button>
          <button className="btn btn-secondary" onClick={onShowRules}>
            Правила
          </button>
          <button className="btn btn-secondary" onClick={onShowRecords}>
            Рекорды
          </button>
        </div>
      </div>
    </div>
  );
}
