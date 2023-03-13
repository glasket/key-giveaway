import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { App } from './App';
import { ErrorPage } from './ErrorPage';
import './index.css';
import { Drop } from './routes/drop/Drop';
import { Drops } from './routes/drops/Drops';
import { WonItems } from './routes/won-items/WonItems';

declare global {
  interface Window {
    fbAsyncInit: any;
    FB: any;
  }
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
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
    ],
  },
]);

window.fbAsyncInit = function () {
  window.FB.init({
    appId: '1832998360370838',
    autoLogAppEvents: true,
    cookie: false,
    xfbml: false,
    status: true,
    version: 'v16.0',
  });
  window.FB.getLoginStatus((resp: any) => {
    console.log(resp);
    if (resp.authResponse) {
      if (
        document.cookie
          .split(';')
          .filter((v) => v.split('=')[0].trim() === 'kga_sess').length > 0
      ) {
        console.log('Logged in already');
      }
    }
  });
};

// TODO User context provider seeded by the above function

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
