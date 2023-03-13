export type Drop = {
  id: string;
  name: string;
  ends_at: Date;
  items: Array<Item>;
};

export type User = {
  id: string;
  is_friends: boolean;
  won_items: Array<Item>;
};

export type Item = {
  id: string;
  drop_id: string;
  name: string;
  items: Array<Game>;
  entries: Set<string>;
};

export type Game = {
  name: string;
  appId: string;
  key: string;
};
