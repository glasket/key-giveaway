export class KeyTakenError extends Error {
  readonly key: string;

  constructor(key: string) {
    super(`${key} already in use`);
    this.name = 'KeyTakenError';
    this.key = key;
  }
}
