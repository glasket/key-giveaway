import { useLocation, useNavigate } from 'react-router-dom';
import { Identity } from '../ident/Identity';
import { ThemeButton } from '../theme/Theme';
import styles from './Nav.module.css';
import { Logo } from './Logo';
import { Icon } from '../utility/Icon';

const Nav = () => {
  const loc = useLocation();
  const navigate = useNavigate();

  const path = loc.pathname.split('/').slice(1);
  const isRoot = path[0] === '';

  const returnHome = () => navigate('/');

  return (
    <nav className={styles['nav']}>
      {isRoot || (
        <button className={styles['back']} onClick={returnHome}>
          <Icon icon="arrow_back" />
        </button>
      )}
      <div className={styles['logo']}>
        <Logo />
      </div>
      <div className={styles['identity']}>
        <ThemeButton />
        <Identity />
      </div>
    </nav>
  );
};

export { Nav };
