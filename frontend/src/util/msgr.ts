import { KeyTakenError } from './errors';

const registry = new Map<string, unknown>();

type RegEvent = {
  key: string;
  value: unknown;
};

const isMessageEvent = (evt: Event): evt is MessageEvent<RegEvent> => {
  return 'data' in evt;
};

const REG_EVENT = 'registered_event';

const registryDispatch = new EventTarget();

export const request = async (key: string): Promise<unknown> => {
  console.log(`Requesting ${key}`);
  if (registry.has(key)) {
    return new Promise((resolve) => resolve(registry.get(key)));
  } else {
    console.log(`Registering new event for key ${key}`);
    return new Promise((resolve) => {
      const handler = (evt: Event) => {
        if (isMessageEvent(evt) && evt.data.key === key) {
          registryDispatch.removeEventListener(REG_EVENT, handler);
          resolve(evt.data.value);
        }
      };
      registryDispatch.addEventListener(REG_EVENT, handler);
    });
  }
};

export const register = (key: string, value: unknown) => {
  console.log(`Adding ${key}: ${value}`);
  if (registry.has(key)) {
    throw new KeyTakenError(key);
  }

  registry.set(key, value);
  registryDispatch.dispatchEvent(
    new MessageEvent<RegEvent>(REG_EVENT, {
      data: {
        key: key,
        value: value,
      },
    })
  );
};
