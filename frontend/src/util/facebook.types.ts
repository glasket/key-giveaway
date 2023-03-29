import { FacebookLoginResponse } from '../Responses';

export type authResponse = {
  accessToken: string;
  expiresIn: string;
  signedRequest: string;
  userID: string;
};

export type getLoginStatusResponse = {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse: {};
};

export type initParams = {
  appId: string;
  autoLogAppEvents?: boolean;
  version: string;
  cookie?: boolean;
  localStorage?: boolean;
  status?: boolean;
  xfbml?: boolean;
  frictionlessRequests?: boolean;
  hideFlashCallback?: null | Function;
};

export type FacebookErrorResponse = {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode: number;
    fbtrace_id: string;
  };
};

export type FacebookToken = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

export type FacebookSDK = {
  init: (params: initParams) => void;
  api: (
    path: string,
    method: 'get' | 'post' | 'delete',
    params: { access_token?: string;[key: string]: any; },
    callback: (response: object) => void
  ) => void;
  getLoginStatus: (
    callback: (response: getLoginStatusResponse) => void
  ) => void;
  login: (callback: (response: FacebookLoginResponse) => void) => void;
  logout: (callback: () => void) => void;
};

export type FacebookMeResponse = {
  name: string;
  id: string;
  picture: {
    data: {
      height: number,
      is_silhouette: boolean,
      url: string,
      width: number;
    };
  };
};
