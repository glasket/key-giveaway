import { GetDropItemsResponse, GetDropsResponse, isLoginResponse, LoginRequest, LoginResponse } from '../Responses';
import { STORAGE_KEY } from '../util/consts';

import { Drop, dropFromJson, Item, itemFromJson, Json } from '../Models';

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

const invoke = () => { };

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
    console.log(respBody);
    if (isLoginResponse(respBody)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(respBody));
      return respBody;
    } else {
      throw new Error('Something went wrong with Login');
    }
  },
  Logout: async (): Promise<boolean> => {
    const resp = await fetch(`${url}/logout`, {
      method: 'POST',
      ...fetchProps
    });
    if (resp.status !== 200) {
      console.error(resp.statusText);
      return false;
    }
    return true;
  },
  GetDrops: async (old: boolean): Promise<GetDropsResponse> => {
    const resp = await fetch(`${url}/drops?old=${old}`, {
      ...fetchProps
    });
    if (resp.status !== 200) {
      console.error(resp.statusText);
      throw new Error(resp.statusText);
    }
    const maybeDrops = await resp.json();
    if (maybeDrops == null) {
      return [];
    }
    if (!(maybeDrops instanceof Array)) {
      throw new Error("GetDrops didn't return Array or null");
    }
    return (maybeDrops as Array<Json<Drop>>).map(v => dropFromJson(v)).sort((a, b) => b.ends_at.getTime() - a.ends_at.getTime());
  },
  GetDropItems: async (dropId: string): Promise<GetDropItemsResponse> => {
    const resp = await fetch(`${url}/drop/${dropId}`, {
      ...fetchProps
    });
    if (resp.status !== 200) {
      console.error(resp.statusText);
      throw new Error(resp.statusText);
    }
    const maybeItems = await resp.json();
    if (maybeItems == null) {
      return [];
    }
    if (!(maybeItems instanceof Array)) {
      throw new Error("GetDropItems didn't return an Array or null");
    }
    return (maybeItems as Array<Json<Item>>).map(v => {
      let newV = itemFromJson(v);
      newV.items.sort((a, b) => a.name.localeCompare(b.name));
      return newV;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }
};
