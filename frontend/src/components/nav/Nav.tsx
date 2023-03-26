import { useLocation, useNavigate } from 'react-router-dom';
import { Identity } from '../ident/Identity';
import styles from './Nav.module.css';

type Properties = {};

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
          &#x2B60;
        </button>
      )}
      <div className={styles['logo']}>LOGO</div>
      <Identity className={styles['identity']} />
    </nav>
  );
};

export { Nav };
