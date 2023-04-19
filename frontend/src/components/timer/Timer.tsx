import React, { useEffect, useRef, useState, Fragment } from 'react';
import { pluralizer } from '../../util/pluralizer';

type TimerProps = {
  end: Date;
};

const secInMs = 1000;
const minInMs = secInMs * 60;
const hourInMs = minInMs * 60;
const dayInMs = hourInMs * 24;

const secondsMax = 59;
const minutesMax = 59;
const hoursMax = 23;

export const Timer = ({ end }: TimerProps) => {
  const timeInMs = useRef(end.getTime() - Date.now());
  const [expired, setExpired] = useState(timeInMs.current < 0);
  const [timeRemaining, setTimeRemaining] = useState({
    days: Math.floor(timeInMs.current / dayInMs),
    hours: Math.floor((timeInMs.current % dayInMs) / hourInMs),
    minutes: Math.floor(((timeInMs.current % dayInMs) % hourInMs) / minInMs),
    seconds: Math.floor(
      (((timeInMs.current % dayInMs) % hourInMs) % minInMs) / secInMs
    ),
  });

  const { days, hours, minutes, seconds } = timeRemaining;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(({ days, hours, minutes, seconds }) => {
        seconds -= 1;
        if (seconds >= 0) {
          return { days, hours, minutes, seconds };
        }
        seconds = secondsMax;
        minutes -= 1;
        if (minutes >= 0) {
          return { days, hours, minutes, seconds };
        }
        minutes = minutesMax;
        hours -= 1;
        if (hours >= 0) {
          return { days, hours, minutes, seconds };
        }
        hours = hoursMax;
        days -= 1;
        if (days >= 0) {
          return { days, hours, minutes, seconds };
        }
        setExpired(true);
        clearInterval(interval);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      });
    }, secInMs);

    return () => clearInterval(interval);
  }, []);

  let components = [
    <Fragment key="day">{pluralizer(days, 'day')} </Fragment>,
    <Fragment key="hour">{pluralizer(hours, 'hour')} </Fragment>,
    <Fragment key="minute">{pluralizer(minutes, 'minute')} </Fragment>,
    <Fragment key="second">{pluralizer(seconds, 'second')}</Fragment>,
  ];

  if (days === 0) {
    components.shift();
    if (hours === 0) {
      components.shift();
      if (minutes === 0) {
        components.shift();
      }
    }
  }

  return expired ? <h3>Expired</h3> : <div>{components}</div>;
};
