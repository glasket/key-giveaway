import * as O from 'fp-ts/lib/Option';

const rgbCoeff = [0.299, 0.587, 0.114];

export const getBrightness = (rgb: string): O.Option<number> => {
  if (rgb.startsWith('#')) {
    rgb = rgb.slice(1);
  }
  const size = rgb.length / 3;
  if (!(size === 1 || size === 2)) {
    return O.none;
  }

  const brightness = rgb.match(/.{1,2}/g)?.map(v => parseInt(v, 16)).reduce((pVal, cVal, idx) => pVal += cVal * cVal * rgbCoeff[idx]!);
  if (brightness == null) {
    return O.none;
  }
  return O.some(Math.sqrt(brightness));
};