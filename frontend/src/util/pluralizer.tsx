export const pluralizer = (num: number, singular: string, plural?: string) =>
  num === 1
    ? `${num} ${singular}`
    : `${num} ${plural !== undefined ? plural : singular + 's'}`;
