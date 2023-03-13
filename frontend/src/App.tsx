import 'react';
import { useContext } from 'react';
import { Nav } from './components/nav/Nav';

const App = () => {
  console.log(
    document.cookie.split(';').filter((v) => v.split('=')[0] === 'kga_sess')
      .length
  );
  return <Nav />;
};

export { App };
