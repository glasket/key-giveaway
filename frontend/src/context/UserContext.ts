import { createContext, Dispatch, SetStateAction } from 'react';
import { FacebookToken } from '../util/facebook.types';

export type UserData = {
  id: string;
  token: FacebookToken;
  name: string;
  isFriends: boolean;
  picture: string;
};

export const isUserData = (obj: any): obj is UserData => {
  return 'token' in obj && 'name' in obj;
};

type UserContextType = [
  user: UserData | null,
  setUser: Dispatch<SetStateAction<UserData | null>>
];

export const UserContext = createContext<UserContextType>([null, () => { }]);

export const USER_REGISTRY_KEY = 'user_data';
