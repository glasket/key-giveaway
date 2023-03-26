import { request } from '../../util/msgr';
import { useCallback, useContext, useEffect, useState } from 'react';
import { API } from '../../api/api';
import { FacebookLoginResponse, LoginResponse } from '../../Responses';
import { FB_REG_KEY, STORAGE_KEY } from '../../util/consts';
import { UserContext, UserData } from '../../context/UserContext';
import { FacebookSDK } from '../../util/facebook.types';
import { pipe, flow } from 'fp-ts/lib/function';
import { asTypeC } from '../../util/as';
import { FacebookApi } from '../../util/facebook';
import { keys } from '../../../transformers/ts-transformer-keys';

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
  className: string | undefined;
};

const Identity = ({ className }: IdentityProps) => {
  const [userData, setUserData] = useContext(UserContext);
  return (
    <div className={className}>
      {userData !== null ? (
        <>{userData.name}</>
      ) : (
        <FacebookButton setUserData={setUserData} />
      )}
    </div>
  );
};

export { Identity };
