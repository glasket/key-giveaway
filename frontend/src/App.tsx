import { useCallback, useContext, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
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
      console.log(user);
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
        <button>A</button>
        <div className={styles['content']}>
          <Outlet />
        </div>
      </UserContext.Provider>
    </>
  ) : (
    <>
      <div>loading</div>
    </>
  );
};

export { App };
