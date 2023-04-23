import ticketSvg from '../../assets/ticket.svg';
import { pluralizer } from '../../util/pluralizer';
import styles from './EntryCounter.module.css';

export const EntryCounter = ({ count }: { count: number }) => (
  <span
    className={styles['container']}
    title={pluralizer(count, 'entry', 'entries')}
  >
    <img src={ticketSvg} />
    <p className="wght-500">{count}</p>
  </span>
);
