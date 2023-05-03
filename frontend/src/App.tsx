import { useCallback, useContext, useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { keys } from '../transformers/ts-transformer-keys';
import {
  UserContext,
  UserData,
  USER_REGISTRY_KEY,
} from './context/UserContext';
import { asType } from './util/as';
import { request } from './util/msgr';
import styles from './App.module.css';

import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';
import { Row } from './components/utility/Flex';

type Properties = {
  nav: JSX.Element;
};

const App = ({ nav }: Properties) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loaded, setLoaded] = useState(false);

  const waitForLoginCheck = useCallback(async () => {
    const userData = asType<UserData>(
      await request(USER_REGISTRY_KEY),
      keys<UserData>()
    );
    console.log(userData);
    if (O.isSome(userData)) {
      console.log('setting userdata');
      pipe(
        userData,
        O.map((x) => setUser(x))
      );
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    waitForLoginCheck();
  }, [waitForLoginCheck]);

  return loaded ? (
    <>
      <UserContext.Provider value={[user, setUser]}>
        {nav}
        <div className={styles['content']}>
          <Outlet />
        </div>
        <Row
          className={styles['footer']}
          Element="footer"
          align="center"
          justify="center"
          gap="1.2rem"
          wrap
        >
          <a href="https://github.com/glasket/key-giveaway">Source</a>
          <Link to="privacy">Privacy Policy</Link>
        </Row>
      </UserContext.Provider>
    </>
  ) : (
    <>
      <div>loading</div>
    </>
  );
};

export { App };
