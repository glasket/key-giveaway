import { request } from '../../util/msgr';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { FB_REG_KEY } from '../../util/consts';
import { UserContext, UserData } from '../../context/UserContext';
import { pipe, flow } from 'fp-ts/lib/function';
import { asTypeC } from '../../util/as';
import { FacebookApi } from '../../util/facebook';
import { keys } from '../../../transformers/ts-transformer-keys';
import styles from './Identity.module.css';
import fblogo from '../../assets/facebook.svg';

import * as E from 'fp-ts/lib/Either';
import * as TE from 'fp-ts/lib/TaskEither';
import { Link } from 'react-router-dom';
import { Column } from '../utility/Flex';

type FacebookButtonProperties = {
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
};

const FacebookButton = ({ setUserData }: FacebookButtonProperties) => {
  const [loginFunc, setLoginFunc] = useState<(() => void) | undefined>();

  const waitForFBSDK = useCallback(async () => {
    pipe(
      await request(FB_REG_KEY),
      asTypeC<FacebookApi>(keys<FacebookApi>()),
      E.fromOption(() => 'facebook sdk failed to load'),
      E.match(
        (err) => console.error(err),
        (fb) =>
          setLoginFunc(() =>
            pipe(
              fb.Login(),
              TE.match((e) => alert(e.message), flow(setUserData))
            )
          )
      )
    );
  }, []);

  useEffect(() => {
    waitForFBSDK();
  }, [waitForFBSDK]);

  return (
    <button
      className={styles['fb-btn']}
      disabled={loginFunc === undefined}
      onClick={loginFunc}
    >
      <img src={fblogo} /> Login
    </button>
  );
};

export const Identity = () => {
  const [userData, setUserData] = useContext(UserContext);
  const [dropOpen, setDropOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const closeDropHandler = useCallback(
    (e: MouseEvent) => {
      if (dropOpen && ref.current && !ref.current.contains(e.target as Node))
        setDropOpen(false);
    },
    [dropOpen]
  );

  useEffect(() => {
    window.addEventListener('click', closeDropHandler);
    return () => window.removeEventListener('click', closeDropHandler);
  }, [closeDropHandler]);

  const logoutHandler = useCallback(async () => {
    pipe(
      await request(FB_REG_KEY),
      asTypeC<FacebookApi>(keys<FacebookApi>()),
      E.fromOption(() => 'facebook sdk failed to load'),
      E.match(
        (err) => console.error(err),
        async (fb) => {
          if (await fb.Logout()) {
            setUserData(null);
          }
        }
      )
    );
  }, []);

  return (
    <>
      {userData !== null ? (
        <div className="round h-100" ref={ref}>
          <button
            className={['round transparent', styles['fb-prof-btn']]
              .join(' ')
              .trim()}
            onClick={() => setDropOpen(!dropOpen)}
          >
            <img className="round" src={userData.picture} />
          </button>
          <Column
            className={styles['dropdown']}
            hidden={!dropOpen}
            align="center"
            Element="div"
            gap="0.8rem"
          >
            <Link to="won">Won Items</Link>
            <button onClick={logoutHandler} className="link">
              Logout
            </button>
          </Column>
        </div>
      ) : (
        <FacebookButton setUserData={setUserData} />
      )}
    </>
  );
};
