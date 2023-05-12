import { pipe } from 'fp-ts/lib/function';
import { keys } from '../transformers/ts-transformer-keys';
import { asTypeC } from './util/as';

import * as O from 'fp-ts/lib/Option';

export type Json<T> = {
  readonly [Property in keyof T]: any
};

export type Drop = {
  readonly id: string;
  readonly name: string;
  readonly ends_at: Date;
  readonly items?: Array<Item>;
};

export const dropFromJson = (json: Json<Drop>): Drop => {
  if (
    typeof json.id === 'string' &&
    typeof json.name === 'string' &&
    typeof json.ends_at === 'string'
  ) {
    if (json.items instanceof Array) {
      return {
        id: json.id,
        name: json.name,
        ends_at: new Date(json.ends_at),
        items: json.items.filter(i => pipe(i, asTypeC(keys<Json<Item>>()), O.isSome)).map(itemFromJson)
      };
    }
    return {
      id: json.id,
      name: json.name,
      ends_at: new Date(json.ends_at),
      items: []
    };
  }
  throw new Error('Not a drop');
};

export type Item = {
  readonly id: string;
  readonly drop_id: string;
  readonly name: string;
  readonly items: Array<Game>;
  readonly entries: Set<string>;
};

export const itemFromJson = (json: Json<Item>): Item => {
  if (
    typeof json.id === 'string' &&
    typeof json.drop_id === 'string' &&
    typeof json.name === 'string' &&
    json.items instanceof Array &&
    json.entries instanceof Array
  ) {
    return {
      id: json.id,
      drop_id: json.drop_id,
      name: json.name,
      items: json.items.map(gameFromJson),
      entries: new Set(json.entries)
    };
  }
  throw new Error('Not an item');
};

export type Game = {
  readonly name: string;
  readonly appId: string;
  readonly key: string;
  readonly review_score: number;
  readonly price: number;
  readonly initial_price: number;
  readonly discount: number;
  readonly locked_regions: Set<string>;
};

export const gameFromJson = (json: Json<Game>): Game => {
  if (
    typeof json.name === 'string' &&
    typeof json.appId === 'string' &&
    typeof json.key === 'string' &&
    typeof json.review_score === 'number' &&
    typeof json.price === 'number' &&
    typeof json.initial_price === 'number' &&
    typeof json.discount === 'number' &&
    (json.locked_regions instanceof Array || json.locked_regions === undefined)
  ) {
    return {
      name: json.name,
      appId: json.appId,
      key: json.key,
      review_score: json.review_score,
      price: json.price,
      initial_price: json.initial_price,
      discount: json.discount,
      locked_regions: new Set(json.locked_regions)
    };
  }
  throw new Error('Not a game');
};