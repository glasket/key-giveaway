import { pipe, flow } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';
import * as B from 'fp-ts/lib/boolean';

export const isObject = (obj: unknown): obj is object =>
  typeof obj === 'object' && obj !== null;

export const isType = <T extends object>(
  obj: unknown,
  keys: (keyof T)[]
): obj is T => pipe(
  isObject(obj) ? O.some(obj) : O.none,
  O.match(
    () => false,
    (obj) => pipe(
      getKeys(obj),
      (k) => { console.log(k); console.log(keys); return k; },
      (objKeys) => keys.every(v => objKeys.includes(v.toString()))
    )
  )
);

export const asTypeC = <T extends object>(keys: (keyof T)[]) => (obj: unknown) => asType<T>(obj, keys);

export const asType = <T extends object>(
  obj: unknown,
  keys: (keyof T)[]
): O.Option<T> => (isType<T>(obj, keys) ? O.some(obj) : O.none);

const getKeys = (obj: object) => pipe(
  obj,
  Reflect.ownKeys,
  (keys) => pipe(
    obj,
    Reflect.getPrototypeOf,
    O.fromNullable,
    O.match(() => keys,
      flow(
        Reflect.ownKeys,
        (pKeys) => pipe(
          pKeys.some(v => v.toString().startsWith('__')),
          B.match(
            () => pKeys.concat(keys).filter(v => v.toString() !== 'constructor'),
            () => keys
          )
        )
      )
    )
  ));
