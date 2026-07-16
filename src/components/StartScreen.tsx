interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
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
        <button className="btn btn-primary" onClick={onStart}>
          Начать смену
        </button>
      </div>
    </div>
  );
}
