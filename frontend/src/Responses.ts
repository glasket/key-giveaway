import { Drop, Item } from './Models';

type ItemKey = {
  drop_id: string;
  item_id: string;
};

type FacebookToken = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

export type AddRaffleEntryRequest = ItemKey;
export type AddRaffleEntryResponse = Item;

export type GetDropItemsRequest = {
  drop_id: string;
};
export type GetDropItemsResponse = Array<Item>;

export type GetDropsResponse = Array<Drop>;

export type GetWonItemsResponse = Array<Item>;

export type LoginRequest = {
  token: string;
};
export type LoginResponse = {
  token: FacebookToken;
  is_friends: boolean;
};

export const isLoginResponse = (resp: any): resp is LoginResponse => {
  return 'token' in resp && 'is_friends' in resp;
};

export type RemoveRaffleEntryRequest = ItemKey;
export type RemoveRaffleEntryResponse = Item;

export type ErrorResponse = {
  reason: string;
};

export type FacebookAuthResponse = {
  accessToken: string;
  data_access_expiration_time: number;
  userID: string;
  expiresIn: number;
  graphDomain: string;
  signedRequest: string;
};

export type FacebookLoginResponse = {
  authResponse: FacebookAuthResponse | undefined;
  status: string;
};
