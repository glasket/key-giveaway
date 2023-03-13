import { useLocation, useNavigate } from 'react-router-dom';
import { Identity } from '../ident/Identity';

type Properties = {};

const Nav = () => {
  const loc = useLocation();
  const navigate = useNavigate();

  const path = loc.pathname.split('/').slice(1);
  const isRoot = path[0] === '';

  const returnHome = () => navigate('/');

  return (
    <nav>
      {isRoot || <button onClick={returnHome}>&#x2B60;</button>}
      <Identity />
    </nav>
  );
};

export { Nav };
