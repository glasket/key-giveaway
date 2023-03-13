import { json, redirect } from 'react-router-dom';
import { isLoginResponse, LoginRequest, LoginResponse } from '../Responses';

let fetchProps: RequestInit = {
  headers: {
    'Content-Type': 'application/json',
  },
  redirect: 'follow',
  referrerPolicy: 'no-referrer',
};

let url: string;

switch (import.meta.env.MODE) {
  case 'development':
    fetchProps = {
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'include',
      ...fetchProps,
    };
    url = 'http://localhost:3000/api';
    break;
  case 'production':
    fetchProps = {
      mode: 'same-origin',
      cache: 'default',
      credentials: 'same-origin',
      ...fetchProps,
    };
    url = '/api';
}

type InvocationParams = {
  url: string;
  method: 'POST' | 'GET' | 'DELETE';
};

const invoke = () => {};

export const API = {
  Login: async (req: LoginRequest): Promise<LoginResponse> => {
    const resp = await fetch(`${url}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req),
      ...fetchProps,
    });
    console.log(resp);
    const respBody = await resp.json();
    if (isLoginResponse(respBody)) {
      return respBody;
    } else {
      throw Error();
    }
  },
};
