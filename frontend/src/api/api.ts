import { AddRaffleEntryRequest, AddRaffleEntryResponse, GetDropItemsResponse, GetDropsResponse, GetWonItemsResponse, isLoginResponse, LoginRequest, LoginResponse, RemoveRaffleEntryRequest, RemoveRaffleEntryResponse } from '../Responses';
import { STORAGE_KEY } from '../util/consts';

import { Drop, dropFromJson, Game, Item, itemFromJson, Json } from '../Models';
import { asType } from '../util/as';
import { keys } from '../../transformers/ts-transformer-keys';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

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

const gameSort = (a: Game, b: Game) => a.name.localeCompare(b.name);

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
    if (resp.status !== 200) {
      errorHandle(await resp.json());
    }
    const respBody = await resp.json();
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
      errorHandle(await resp.json());
    }
    return true;
  },
  GetDrops: async (old: boolean): Promise<GetDropsResponse> => {
    const resp = await fetch(`${url}/drops?old=${old}`, {
      ...fetchProps
    });
    if (resp.status !== 200) {
      errorHandle(await resp.json());
    }
    const maybeDrops = await resp.json();
    if (maybeDrops == null) {
      return [];
    }
    if (!(maybeDrops instanceof Array)) {
      throw new Error("GetDrops didn't return Array or null");
    }
    return (maybeDrops as Array<Json<Drop>>).map(v => dropFromJson(v)).sort((a, b) => a.ends_at.getTime() - b.ends_at.getTime());
  },
  GetDropItems: async (dropId: string): Promise<GetDropItemsResponse> => {
    const resp = await fetch(`${url}/drop/${dropId}`, {
      ...fetchProps
    });
    if (resp.status !== 200) {
      errorHandle(await resp.json());
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
      newV.items.sort(gameSort);
      return newV;
    }).sort((a, b) => a.name.localeCompare(b.name));
  },
  AddEntry: async (req: AddRaffleEntryRequest): Promise<AddRaffleEntryResponse> => {
    const resp = await fetch(`${url}/entry`, {
      method: 'POST',
      body: JSON.stringify(req),
      ...fetchProps
    });
    if (resp.status !== 200) {
      errorHandle(await resp.json());
    }
    const maybeItem = asType<Json<AddRaffleEntryResponse>>(await resp.json(), keys<Item>());
    return pipe(maybeItem,
      O.fold(
        () => { throw new Error('Response was not of correct type'); },
        (item) => ({
          id: item.id,
          drop_id: item.drop_id,
          name: item.name,
          items: item.items.sort(gameSort),
          entries: new Set(item.entries),
        } as AddRaffleEntryResponse)
      ));
  },
  RemoveEntry: async (req: RemoveRaffleEntryRequest): Promise<RemoveRaffleEntryResponse> => {
    const resp = await fetch(`${url}/entry`, {
      method: 'DELETE',
      body: JSON.stringify(req),
      ...fetchProps
    });
    if (resp.status !== 200) {
      errorHandle(await resp.text());
    }
    const maybeItem = asType<Json<RemoveRaffleEntryResponse>>(await resp.json(), keys<Item>());
    return pipe(maybeItem,
      O.fold(
        () => { throw new Error('Response was not of correct type'); },
        (item) => ({
          id: item.id,
          drop_id: item.drop_id,
          name: item.name,
          items: item.items.sort(gameSort),
          entries: new Set(item.entries),
        } as RemoveRaffleEntryResponse)
      ));
  },
  GetWonItems: async (): Promise<GetWonItemsResponse> => {
    const resp = await fetch(`${url}/won-items`, {
      method: 'GET',
      ...fetchProps
    });
    if (resp.status !== 200) {
      errorHandle(await resp.text());
    }
    const maybeItems = await resp.json();
    if (maybeItems == null) {
      return [];
    }
    if (!(maybeItems instanceof Array)) {
      throw new Error("GetWonItems didn't return an Array or null");
    }
    return (maybeItems as Array<Json<Item>>).map(v => {
      let newV = itemFromJson(v);
      newV.items.sort((a, b) => a.name.localeCompare(b.name));
      return newV;
    });
  }
};

const errorHandle = (err: string) => {
  console.error(err);
  throw new Error(err);
};