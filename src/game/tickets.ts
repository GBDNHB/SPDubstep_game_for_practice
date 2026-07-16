import type { LogLine, PasswordChip, SequenceStep, Ticket, TicketOption } from './types';
import { shuffle } from './logic';

interface ChoreSeed {
  title: string;
}

interface DecisionSeed {
  title: string;
  prompt: string;
  options: TicketOption[];
}

interface QuizSeed {
  title: string;
  prompt: string;
  correctIsTrue: boolean;
  feedback: string;
}

interface PasswordSeed {
  title: string;
  prompt: string;
}

interface SequenceSeed {
  title: string;
  prompt: string;
  steps: string[]; // в правильном порядке
}

interface LogScanSeed {
  title: string;
  prompt: string;
  lines: { text: string; suspicious: boolean }[];
}

/** Обычная рутина отдела — просто нужно успеть отметить выполненной. */
const CHORES: ChoreSeed[] = [
  { title: 'Сдать таймшит за неделю в бухгалтерию' },
  { title: 'Заполнить отчёт по инцидентам ИБ за смену' },
  { title: 'Проверить логи резервного копирования серверов' },
  { title: 'Разослать обновление антивируса на рабочие станции' },
  { title: 'Сверить список доступов уволившихся сотрудников за месяц' },
  { title: 'Подготовить памятку по фишингу для отдела продаж' },
  { title: 'Согласовать заявку на новый монитор для отдела' },
];

/** Короткие сценарии: нужно выбрать решение, соответствующее политике ИБ. */
const DECISIONS: DecisionSeed[] = [
  {
    title: 'Запрос пароля по телефону',
    prompt:
      'Сотрудник бухгалтерии звонит и просит продиктовать его пароль от почты — говорит, очень срочно, забыл свой.',
    options: [
      {
        label: 'Продиктовать пароль, раз просит коллега',
        correct: false,
        feedback: 'Пароли никогда не передаются по телефону — это классическая социальная инженерия.',
      },
      {
        label: 'Отказать и сбросить пароль через официальную процедуру',
        correct: true,
        feedback: 'Верно: сброс пароля должен идти только через штатную процедуру подтверждения личности.',
      },
    ],
  },
  {
    title: 'Доступ уволенного сотрудника',
    prompt: 'HR просит оставить доступ уволившемуся сотруднику ещё на неделю, «на всякий случай».',
    options: [
      {
        label: 'Оставить доступ, чтобы не создавать проблем HR',
        correct: false,
        feedback: 'Доступ уволенных сотрудников нужно закрывать немедленно — иначе это открытая дверь для утечки.',
      },
      {
        label: 'Отклонить и закрыть доступ согласно регламенту',
        correct: true,
        feedback: 'Верно: увольнение — сигнал немедленно отозвать все доступы.',
      },
    ],
  },
  {
    title: 'Личная флешка в сети',
    prompt: 'Коллега просит разрешить его личный USB-накопитель для «быстрого переноса файлов» на рабочий компьютер.',
    options: [
      {
        label: 'Разрешить, чтобы не задерживать работу',
        correct: false,
        feedback: 'Личные накопители — частый источник заражения вредоносным ПО.',
      },
      {
        label: 'Отклонить, предложить корпоративное файловое хранилище',
        correct: true,
        feedback: 'Верно: для обмена файлами есть согласованные корпоративные каналы.',
      },
    ],
  },
  {
    title: 'Открыть порт «для удобства»',
    prompt: 'Разработчик просит открыть RDP-порт наружу, чтобы подключаться к серверу из дома напрямую.',
    options: [
      {
        label: 'Открыть порт — так удобнее коллеге',
        correct: false,
        feedback: 'Открытый RDP наружу — один из самых частых векторов взлома серверов.',
      },
      {
        label: 'Отклонить и предложить подключение через VPN',
        correct: true,
        feedback: 'Верно: удалённый доступ должен идти только через защищённый VPN.',
      },
    ],
  },
  {
    title: 'Срочное согласование доступа',
    prompt:
      'Письмо якобы от директора просит немедленно выдать новому подрядчику полный доступ к базе клиентов — «доверься мне, потом объясню».',
    options: [
      {
        label: 'Выдать доступ — раз директор просит, не будем спорить',
        correct: false,
        feedback: 'Даже «срочные» просьбы от руководства должны проходить обычную процедуру согласования — частая схема BEC-мошенничества.',
      },
      {
        label: 'Уточнить запрос по официальному каналу перед выдачей доступа',
        correct: true,
        feedback: 'Верно: подозрительно срочные запросы всегда стоит перепроверять напрямую.',
      },
    ],
  },
  {
    title: 'Общий пароль для команды',
    prompt: 'Новый тимлид предлагает завести один общий пароль от почты на всю команду — «так проще делиться доступом».',
    options: [
      {
        label: 'Согласиться — так действительно удобнее',
        correct: false,
        feedback: 'Общие пароли исключают возможность отследить, кто и что делал — грубое нарушение политики ИБ.',
      },
      {
        label: 'Предложить индивидуальные учётки с разграничением прав',
        correct: true,
        feedback: 'Верно: у каждого сотрудника должен быть свой аккаунт и своя ответственность.',
      },
    ],
  },
];

/** Быстрый вопрос «верно/неверно». */
const QUIZZES: QuizSeed[] = [
  {
    title: 'Быстрый вопрос: пароли',
    prompt: 'Пароль стоит хотя бы раз записать в файл на рабочем столе — для памяти.',
    correctIsTrue: false,
    feedback: 'Неверно: пароли нельзя хранить в открытом виде на рабочем столе — это первое, что найдёт вирус.',
  },
  {
    title: 'Быстрый вопрос: обновления',
    prompt: 'Обновления безопасности лучше устанавливать сразу после выхода, а не откладывать.',
    correctIsTrue: true,
    feedback: 'Верно: большинство атак используют уязвимости, для которых патч уже вышел, но не установлен.',
  },
  {
    title: 'Быстрый вопрос: вложения',
    prompt: 'Если письмо пришло от знакомого коллеги, вложение можно открывать без проверки.',
    correctIsTrue: false,
    feedback: 'Неверно: адрес отправителя легко подделать или взломать — проверка нужна всегда.',
  },
  {
    title: 'Быстрый вопрос: носители',
    prompt: 'USB-накопитель неизвестного происхождения нельзя подключать к рабочему компьютеру, даже «просто посмотреть».',
    correctIsTrue: true,
    feedback: 'Верно: это классический вектор заражения (в том числе физического, вроде BadUSB).',
  },
  {
    title: 'Быстрый вопрос: резервные копии',
    prompt: 'Бэкапы достаточно просто создавать — проверять их восстановление не обязательно.',
    correctIsTrue: false,
    feedback: 'Неверно: нерабочий бэкап обнаруживается обычно в худший момент — во время реального сбоя.',
  },
  {
    title: 'Быстрый вопрос: доступы',
    prompt: 'Чем больше сотрудников имеют доступ ко всем системам, тем быстрее идёт работа — это хорошо.',
    correctIsTrue: false,
    feedback: 'Неверно: доступ должен выдаваться по принципу минимально необходимых прав.',
  },
];

/** Собрать пароль, отвечающий политике надёжности. */
const PASSWORD_TICKETS: PasswordSeed[] = [
  {
    title: 'Тикет: новый пароль для сервера отчётности',
    prompt: 'Собери требования к паролю так, чтобы он прошёл проверку политики ИБ, и утверди его.',
  },
  {
    title: 'Тикет: пароль для учётной записи подрядчика',
    prompt: 'Подрядчику нужен временный доступ — собери требования к надёжному паролю перед выдачей.',
  },
];

const PASSWORD_CHIPS: PasswordChip[] = [
  { id: 'good-length', label: 'Не короче 16 символов', good: true },
  { id: 'good-upper', label: 'Есть заглавные буквы', good: true },
  { id: 'good-symbol', label: 'Есть спецсимволы (!, #, %)', good: true },
  { id: 'good-random', label: 'Случайный набор символов', good: true },
  { id: 'bad-pet', label: 'Кличка кота', good: false },
  { id: 'bad-birthday', label: 'Дата рождения', good: false },
  { id: 'bad-sequence', label: 'Простая последовательность (123456)', good: false },
];

/** Восстановить правильный порядок действий при инциденте. */
const SEQUENCES: SequenceSeed[] = [
  {
    title: 'Тикет: обнаружен заражённый компьютер',
    prompt: 'Расставь действия в правильном порядке реагирования на инцидент.',
    steps: [
      'Изолировать компьютер от сети, не выключая его',
      'Сообщить в отдел ИБ и руководителю',
      'Не пытаться исправить проблему самостоятельно',
      'Передать компьютер специалистам для анализа',
    ],
  },
  {
    title: 'Тикет: сотрудник открыл подозрительное вложение',
    prompt: 'Расставь действия в правильном порядке.',
    steps: [
      'Отключить компьютер от сети',
      'Немедленно сообщить в отдел ИБ',
      'Не удалять файлы и не перезагружать компьютер самостоятельно',
      'Дождаться специалиста для анализа заражения',
    ],
  },
  {
    title: 'Тикет: утечка пароля от общего аккаунта',
    prompt: 'Расставь действия в правильном порядке.',
    steps: [
      'Сменить пароль немедленно',
      'Проверить журнал входов на подозрительную активность',
      'Сообщить всем, кто пользовался аккаунтом',
      'Задокументировать инцидент',
    ],
  },
];

/** Найти подозрительную запись среди строк лога. */
const LOG_SCANS: LogScanSeed[] = [
  {
    title: 'Тикет: логи входа в систему',
    prompt: 'Найди подозрительную запись в логе входов за утро.',
    lines: [
      { text: '10:02 — Вход: a.ivanova, IP 10.0.4.12 (офис, Минск)', suspicious: false },
      { text: '10:05 — Вход: r.kovalev, IP 10.0.4.20 (офис, Минск)', suspicious: false },
      { text: '10:07 — Вход: admin, IP 187.62.14.9 (страна: Бразилия), успешно', suspicious: true },
      { text: '10:11 — Вход: m.orlova, IP 10.0.4.18 (офис, Минск)', suspicious: false },
    ],
  },
  {
    title: 'Тикет: логи попыток входа',
    prompt: 'Найди подозрительную запись в логе попыток входа.',
    lines: [
      { text: '02:14 — 47 неудачных попыток входа: root, IP 5.188.10.44', suspicious: true },
      { text: '09:00 — Вход: buhgalter1, IP 10.0.2.5 (офис, Минск)', suspicious: false },
      { text: '09:03 — Вход: it-admin, IP 10.0.2.7 (офис, Минск)', suspicious: false },
      { text: '09:15 — Вход: hr-manager, IP 10.0.2.9 (офис, Минск)', suspicious: false },
    ],
  },
  {
    title: 'Тикет: логи файлового сервера',
    prompt: 'Найди подозрительную запись в логе файлового сервера.',
    lines: [
      { text: '14:00 — j.petrov скачал 3 файла из /reports/', suspicious: false },
      { text: '14:02 — j.petrov скачал 1200 файлов из /clients/ за 40 секунд', suspicious: true },
      { text: '14:05 — j.petrov вышел из системы', suspicious: false },
      { text: '14:10 — Резервная копия завершена успешно', suspicious: false },
    ],
  },
];

function buildPool(day: number): Ticket[] {
  const chores: Ticket[] = CHORES.map((c, i) => ({
    id: `day${day}-chore${i}`,
    kind: 'chore',
    title: c.title,
    done: false,
  }));

  const decisions: Ticket[] = DECISIONS.map((d, i) => ({
    id: `day${day}-decision${i}`,
    kind: 'decision',
    title: d.title,
    prompt: d.prompt,
    options: d.options,
    done: false,
  }));

  const quizzes: Ticket[] = QUIZZES.map((q, i) => ({
    id: `day${day}-quiz${i}`,
    kind: 'quiz',
    title: q.title,
    prompt: q.prompt,
    options: [
      { label: 'Верно', correct: q.correctIsTrue, feedback: q.feedback },
      { label: 'Неверно', correct: !q.correctIsTrue, feedback: q.feedback },
    ],
    done: false,
  }));

  const passwords: Ticket[] = PASSWORD_TICKETS.map((p, i) => ({
    id: `day${day}-password${i}`,
    kind: 'password',
    title: p.title,
    prompt: p.prompt,
    passwordChips: PASSWORD_CHIPS,
    done: false,
  }));

  const sequences: Ticket[] = SEQUENCES.map((s, i) => {
    const steps: SequenceStep[] = s.steps.map((text, stepIndex) => ({
      id: `day${day}-sequence${i}-step${stepIndex}`,
      text,
    }));
    return {
      id: `day${day}-sequence${i}`,
      kind: 'sequence',
      title: s.title,
      prompt: s.prompt,
      steps: shuffle(steps),
      correctOrder: steps.map((step) => step.id),
      done: false,
    };
  });

  const logScans: Ticket[] = LOG_SCANS.map((l, i) => {
    const logLines: LogLine[] = l.lines.map((line, lineIndex) => ({
      id: `day${day}-logscan${i}-line${lineIndex}`,
      text: line.text,
      suspicious: line.suspicious,
    }));
    return {
      id: `day${day}-logscan${i}`,
      kind: 'logscan',
      title: l.title,
      prompt: l.prompt,
      logLines,
      done: false,
    };
  });

  return [...chores, ...decisions, ...quizzes, ...passwords, ...sequences, ...logScans];
}

export function pickDailyTickets(day: number, count = 3): Ticket[] {
  return shuffle(buildPool(day)).slice(0, count);
}
