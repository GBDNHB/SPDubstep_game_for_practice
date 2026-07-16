import { forwardRef, useImperativeHandle, useState } from 'react';
import { motion, useMotionValue, useTransform, animate, type PanInfo } from 'framer-motion';
import type { Action, Card } from '../game/types';

interface MailCardProps {
  card: Card;
  onDecide: (action: Action) => void;
}

export interface MailCardHandle {
  decide: (action: Action) => void;
}

const SWIPE_THRESHOLD = 120;
const EXIT_DISTANCE = 700;

export const MailCard = forwardRef<MailCardHandle, MailCardProps>(function MailCard(
  { card, onDecide },
  ref,
) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-16, 16]);
  const passOpacity = useTransform(x, [20, 120], [0, 1]);
  const quarantineOpacity = useTransform(x, [-120, -20], [1, 0]);
  const [locked, setLocked] = useState(false);

  function decide(action: Action) {
    if (locked) return;
    setLocked(true);
    const target = action === 'pass' ? EXIT_DISTANCE : -EXIT_DISTANCE;
    animate(x, target, { duration: 0.32, ease: 'easeIn' }).then(() => {
      onDecide(action);
    });
  }

  useImperativeHandle(ref, () => ({ decide }));

  function handleDragEnd(_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    if (info.offset.x > SWIPE_THRESHOLD) {
      decide('pass');
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      decide('quarantine');
    } else {
      animate(x, 0, { type: 'spring', stiffness: 320, damping: 26 });
    }
  }

  return (
    <motion.div
      className="mail-card"
      style={{ x, rotate }}
      drag={locked ? false : 'x'}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.85}
      onDragEnd={handleDragEnd}
    >
      <motion.div className="swipe-tag swipe-tag--pass" style={{ opacity: passOpacity }}>
        ПРОПУСТИТЬ
      </motion.div>
      <motion.div
        className="swipe-tag swipe-tag--quarantine"
        style={{ opacity: quarantineOpacity }}
      >
        В КАРАНТИН
      </motion.div>
      <div className="mail-card__row">
        <span className="mail-card__field-label">От кого</span>
        <span className="mail-card__sender mono">{card.sender}</span>
      </div>
      <div className="mail-card__row">
        <span className="mail-card__field-label">Тема</span>
        <span className="mail-card__subject">{card.subject}</span>
      </div>
      <div className="mail-card__body">{card.body}</div>
      {card.attachment && (
        <div className="mail-card__attachment">
          <span className="mail-card__attachment-icon">📎</span>
          <span className="mail-card__attachment-name">{card.attachment}</span>
        </div>
      )}
    </motion.div>
  );
});
