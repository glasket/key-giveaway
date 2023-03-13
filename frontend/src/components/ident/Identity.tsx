import { useEffect, useState } from 'react';
import { API } from '../../api/api';
import { FacebookLoginResponse } from '../../Responses';

declare global {
  interface Window {
    FB: any;
  }
}

type Properties = {};

const FacebookButton = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    document.getElementById('fb-sdk-script')?.addEventListener('load', () => {
      setLoaded(true);
      console.log('loaded');
    });
  }, []);

  const loginFunc = () => {
    window.FB.login((resp: FacebookLoginResponse) => {
      console.log(resp);
      if (resp.authResponse !== undefined) {
        API.Login({ token: resp.authResponse.accessToken }).then((resp) => {
          console.log(resp);
        });

        window.FB.api('/me', (resp: any) => {
          console.log(resp);
        });
      }
    });
  };

  return (
    <>
      <button disabled={!loaded} onClick={loginFunc}>
        Login with Facebook
      </button>
      <button disabled={true} onClick={loginFunc}>
        Login with Facebook
      </button>
    </>
  );
};

const Identity = (props: Properties) => (
  <div>
    <FacebookButton />
  </div>
);

export { Identity };
