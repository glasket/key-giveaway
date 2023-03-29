import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './Theme.module.css';

import * as O from 'fp-ts/lib/Option';
import { getBrightness } from '../../util/HSP';
import { pipe } from 'fp-ts/lib/function';

type Theme = 'dark' | 'light';

const themes: Theme[] = ['dark', 'light'];

type ThemeSetting = Theme | 'system';

const symbols: Record<Theme, string> = {
  dark: '/moon.svg',
  light: '/sun.svg',
};

export const ThemeButton = () => {
  const [theme, setTheme] = useState<ThemeSetting>('system');
  const [symbol, setSymbol] = useState<string | null>(null);
  const queries = useRef<O.Option<MediaQueryList[]>>(O.none);

  const addMediaListeners = () => {
    if (O.isSome(queries.current)) {
      return;
    }
    const qs = themes.map((t) =>
      window.matchMedia(`(prefers-color-scheme: ${t})`)
    );
    qs.forEach((v, idx, arr) => {
      if (v.matches) {
        setSymbol(symbols[themes[idx]!]);
      }

      arr[idx]!.onchange = (ev: MediaQueryListEvent): any => {
        if (ev.matches) {
          setSymbol(symbols[themes[idx]!]);
        }
      };
    });
    queries.current = O.some(qs);
  };

  const removeEventListeners = () => {
    if (O.isNone(queries.current)) {
      return;
    }
    queries.current.value.forEach((_, idx, arr) => (arr[idx]!.onchange = null));
    queries.current = O.none;
  };

  const legacyThemeCheck = () => {
    const drgb = getComputedStyle(document.documentElement).getPropertyValue(
      '--darkest'
    );
    const lrgb = getComputedStyle(document.documentElement).getPropertyValue(
      '--lightest'
    );

    const currentTheme = pipe<string, O.Option<number>, ThemeSetting>(
      drgb,
      getBrightness,
      O.fold(
        () => {
          console.error(`drgb not valid: ${drgb}`);
          return 'system';
        },
        (dBright) =>
          pipe(
            lrgb,
            getBrightness,
            O.fold(
              () => {
                console.error(`lrgb not valid: ${lrgb}`);
                return 'system';
              },
              (lBright) => (dBright < lBright ? 'light' : 'dark')
            )
          )
      )
    );
    changeTheme(currentTheme);
  };

  const changeTheme = (newTheme: ThemeSetting) => {
    if (newTheme === 'system') {
      document.documentElement.className = '';
      if (window.matchMedia!) {
        addMediaListeners();
      }
    } else {
      if (theme === 'system') {
        removeEventListeners();
      }
      document.documentElement.className = newTheme;
      setSymbol(symbols[newTheme]);
      // TODO Write to localStorage
    }
    setTheme(theme);
  };

  useEffect(() => {
    // TODO check localStorage to see if theme is set

    if (!window.matchMedia) {
      legacyThemeCheck();
      return;
    }

    addMediaListeners();
  }, []);

  const clickHandler = useCallback(() => {
    console.log(theme);
    console.log(symbol);
    switch (theme) {
      case 'system':
        if (symbol === '/moon.svg') {
          changeTheme('light');
          break;
        }
        changeTheme('dark');
        break;
      case 'dark':
        changeTheme('light');
        break;
      case 'light':
        changeTheme('dark');
        break;
    }
  }, [theme, symbol]);

  return (
    <button
      className={`round transparent ${styles['button']}`}
      onClick={clickHandler}
    >
      <img src={symbol ?? ''}></img>
    </button>
  );
};
