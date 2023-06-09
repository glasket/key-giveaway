// API Docs: https://developers.facebook.com/docs/javascript/reference/v16.0

import { flow, pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';
import * as E from 'fp-ts/lib/Either';
import * as T from 'fp-ts/lib/Task';
import * as TE from 'fp-ts/lib/TaskEither';
import * as TO from 'fp-ts/lib/TaskOption';
import * as J from 'fp-ts/lib/Json';
import { FacebookAuthResponse, FacebookLoginResponse, LoginResponse } from '../Responses';
import { asType, asTypeC, isType } from './as';
import { STORAGE_KEY } from './consts';
import {
  FacebookMeResponse,
  FacebookSDK,
} from './facebook.types';
import { keys } from '../../transformers/ts-transformer-keys';
import { UserData } from '../context/UserContext';
import { API } from '../api/api';

const getStoredItem = (key: string): O.Option<string> => {
  const val = localStorage.getItem(key);
  return val !== null ? O.some(val) : O.none;
};

export class FacebookApi {
  readonly #fb: FacebookSDK;

  #token: O.Option<string> = O.none;
  get token(): O.Option<string> {
    return this.#token;
  }
  setToken(value: LoginResponse) {
    if (value.expires_at <= Date.now()) {
      localStorage.removeItem(STORAGE_KEY);
      throw new Error('token expired');
    }
    this.#token = O.some(value.token.access_token);
  }

  #userData: O.Option<UserData> = O.none;

  constructor(FB: FacebookSDK) {
    this.#fb = FB;
  }

  GetStatus(): TO.TaskOption<UserData> {
    return pipe(
      this.#userData,
      O.match(
        () =>
          pipe(
            O.tryCatch(() => getStoredItem(STORAGE_KEY)),
            O.flatten,
            O.fold(
              () => O.none,
              flow(
                J.parse,
                E.match(
                  () => pipe(STORAGE_KEY, (k) => localStorage.removeItem(k), () => O.none),
                  (obj) => asType<LoginResponse>(obj, keys<LoginResponse>())
                )
              )
            ),
            O.fold(
              () => TO.none,
              (logResp) => {
                try {
                  this.setToken(logResp);
                } catch (e: any) {
                  return TO.none;
                }
                return pipe(
                  this.Me(),
                  TE.match((err) => { alert(err); return TO.none; },
                    (resp) => pipe(O.some({
                      token: logResp.token,
                      name: resp.name,
                      isFriends: logResp.is_friends,
                      picture: resp.picture.data.url,
                      id: resp.id
                    } as UserData),
                      (d) => this.#setUserData(d),
                      TO.fromOption
                    )
                  ),
                  T.flatten
                );
              }
            )
          ),
        flow(O.some, TO.fromOption)
      )
    );
  }

  Login(): TE.TaskEither<Error, UserData> {
    return pipe(
      TE.taskify<FacebookLoginResponse, Error>(this.#fb.login)(),
      TE.matchE(
        (resp) => isType<FacebookAuthResponse>(resp.authResponse, keys<FacebookAuthResponse>()) ? TE.right(resp) : TE.left(new Error('Login failed.')),
        (err) => TE.left(err)
      ),
      TE.chain<Error, FacebookLoginResponse, UserData>((resp) => pipe(
        TE.tryCatch(() => API.Login({ token: resp.authResponse!.accessToken }), (r) => r instanceof Error ? r : new Error('Something went wrong')),
        TE.chain(
          (resp) => pipe(
            asType(resp, keys<LoginResponse>()),
            O.fold(
              () => TE.left(new Error('not a login response')),
              (resp) => {
                try {
                  this.setToken(resp);
                } catch (e) {
                  TE.left(e);
                }
                return pipe(
                  this.Me(),
                  TE.chain(
                    (r) => {
                      return pipe(
                        O.some({ token: resp.token, isFriends: resp.is_friends, name: r.name, picture: r.picture.data.url, id: r.id } as UserData),
                        (d) => this.#setUserData(d),
                        TE.fromOption(() => new Error('No userdata'))
                      );
                    }
                  ), TE.orElse((l) => { alert(l); return TE.left(l); })
                );
              }
            )),

        )
      ))
    );
  };

  async Logout(): Promise<boolean> {
    if (await API.Logout()) {
      this.#fb.logout(() => { });
      localStorage.removeItem(STORAGE_KEY);
      return true;
    }
    console.error('logout failed');
    return false;
  }

  Me(): TE.TaskEither<Error, FacebookMeResponse> {
    return pipe(this.token,
      O.match(
        () => TE.left(new Error('Missing token')),
        (token) => pipe(
          TE.taskify(this.#fb.api)('/me?fields=id,name,picture', 'get', {
            access_token: token,
          }),
          TE.matchE(
            (resp) => pipe(resp,
              asTypeC<FacebookMeResponse>(keys<FacebookMeResponse>()),
              O.match(
                () => TE.left(new Error(JSON.stringify(resp))),
                (resp) => TE.right(resp)
              )
            ),
            (err) => TE.left(new Error('Panic'))),
        )
      ));
  };

  #setUserData(status: O.Option<UserData>): O.Option<UserData> {
    this.#userData = status;
    return status;
  }
}
