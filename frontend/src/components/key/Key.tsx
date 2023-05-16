import { Row } from '../utility/Flex';
import { Icon } from '../utility/Icon';
import styles from './Key.module.css';

type Props = {
  gameKey: string;
};

export const Key = ({ gameKey }: Props) => (
  <Row align="center" className={styles['container']}>
    {gameKey.startsWith('https://') ? (
      <a className={styles['container__key']} href={gameKey}>
        {gameKey}
      </a>
    ) : (
      <>
        <span className={styles['container__key']}>{gameKey}</span>
        <button
          onClick={() => navigator.clipboard.writeText(gameKey)}
          className={styles['container__copy']}
        >
          <Icon icon="content_copy" />
        </button>
      </>
    )}
  </Row>
);
