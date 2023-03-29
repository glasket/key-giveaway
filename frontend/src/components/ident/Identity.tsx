import { request } from '../../util/msgr';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { FB_REG_KEY } from '../../util/consts';
import { UserContext, UserData } from '../../context/UserContext';
import { pipe, flow } from 'fp-ts/lib/function';
import { asTypeC } from '../../util/as';
import { FacebookApi } from '../../util/facebook';
import { keys } from '../../../transformers/ts-transformer-keys';
import styles from './Identity.module.css';

import * as E from 'fp-ts/lib/Either';
import * as T from 'fp-ts/lib/Task';
import * as TE from 'fp-ts/lib/TaskEither';
import * as TO from 'fp-ts/lib/TaskOption';

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
    <button disabled={loginFunc === undefined} onClick={loginFunc}>
      Login with Facebook
    </button>
  );
};

type IdentityProps = {
  className?: string;
};

const Identity = ({ className }: IdentityProps) => {
  const [userData, setUserData] = useContext(UserContext);
  const [dropOpen, setDropOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const closeDropHandler = useCallback(
    (e: MouseEvent) => {
      if (dropOpen && ref.current && !ref.current.contains(e.target))
        setDropOpen(false);
    },
    [dropOpen]
  );

  useEffect(() => {
    window.addEventListener('click', closeDropHandler);
    return () => window.removeEventListener('click', closeDropHandler);
  }, [closeDropHandler]);

  return (
    <>
      {userData !== null ? (
        <div ref={ref}>
          <button
            className={['round transparent', styles['fb-prof-btn']]
              .join(' ')
              .trim()}
            onClick={() => setDropOpen(!dropOpen)}
          >
            <img className="round" src={userData.picture} />
          </button>
          <div className={styles['dropdown']} hidden={!dropOpen}>
            {/*// TODO onClick logout */}
            <button className="link">Logout</button>
          </div>
        </div>
      ) : (
        <FacebookButton setUserData={setUserData} />
      )}
    </>
  );
};

export { Identity };
