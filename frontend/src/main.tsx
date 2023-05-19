import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { App } from './App';
import { Nav } from './components/nav/Nav';
import { USER_REGISTRY_KEY } from './context/UserContext';
import { ErrorPage } from './ErrorPage';
import './index.css';
import { Drop } from './routes/drop/Drop';
import { Drops } from './routes/drops/Drops';
import { WonItems } from './routes/won-items/WonItems';
import { AppId, COOKIE_KEY, FB_REG_KEY, STORAGE_KEY } from './util/consts';
import { register } from './util/msgr';
import * as TO from 'fp-ts/lib/TaskOption';
import * as O from 'fp-ts/lib/Option';
import * as T from 'fp-ts/lib/Task';
import { FacebookSDK } from './util/facebook.types';
import { pipe } from 'fp-ts/lib/function';
import { FacebookApi } from './util/facebook';
import ReactModal from 'react-modal';
import { Privacy } from './routes/static/Privacy';
import { Delete } from './routes/delete/Delete';

declare global {
  interface Window {
    fbAsyncInit: any;
    FB: any;
  }
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <App nav={<Nav />} />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/',
        element: <Drops />,
      },
      {
        path: ':dropId',
        element: <Drop />,
      },
      {
        path: 'won',
        element: <WonItems />,
      },
      {
        path: 'privacy',
        element: <Privacy />,
      },
      {
        path: 'delete',
        element: <Delete />,
      },
    ],
  },
]);

window.fbAsyncInit = function () {
  const FB: FacebookSDK = window.FB;
  FB.init({
    appId: AppId,
    autoLogAppEvents: true,
    cookie: false,
    localStorage: false,
    xfbml: false,
    status: false,
    version: 'v16.0',
  });

  // FB.api('/status', 'get', { client_id: AppId }, (resp: any) => {
  //   console.log(resp);
  //   if (resp.authResponse) {
  //     if (
  //       document.cookie
  //         .split(';')
  //         .filter((v) => v.split('=')[0].trim() === 'kga_sess').length > 0
  //     ) {
  //       console.log('Logged in already');
  //     }
  //   }
  // });

  const facebookApi = new FacebookApi(FB);
  pipe(
    facebookApi.GetStatus(),
    TO.fold(
      () => T.of(register(USER_REGISTRY_KEY, null)),
      (userData) =>
        T.of(
          pipe(
            document.cookie
              .split(';')
              .find((c) => c.trim().startsWith(COOKIE_KEY)),
            O.fromNullable,
            O.match(
              () => {
                localStorage.removeItem(STORAGE_KEY);
                register(USER_REGISTRY_KEY, null);
              },
              (c) => register(USER_REGISTRY_KEY, userData)
            )
          )
        )
    )
  )();

  register(FB_REG_KEY, facebookApi);
};

ReactModal.setAppElement('#root');

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
