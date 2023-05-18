import { useEffect, useRef, useState, Fragment } from 'react';

type TimerProps = {
  end: Date;
};

const secInMs = 1000;
const minInSec = 60;
const hourInMin = 60;
const dayInHour = 24;

const formatTimeLeft = (
  timeLeft: number
): { days: number; hours: number; minutes: number; seconds: number } => {
  const sec = Math.floor(timeLeft / secInMs);
  const min = Math.floor(sec / minInSec);
  const hour = Math.floor(min / hourInMin);
  const day = Math.floor(hour / dayInHour);
  return {
    days: day,
    hours: hour % dayInHour,
    minutes: min % hourInMin,
    seconds: sec % minInSec,
  };
};

export const Timer = ({ end }: TimerProps) => {
  const timeInMs = useRef(end.getTime() - Date.now());
  const [expired, setExpired] = useState(timeInMs.current < 0);
  const [timeRemaining, setTimeRemaining] = useState(
    formatTimeLeft(timeInMs.current)
  );

  const { days, hours, minutes, seconds } = timeRemaining;

  useEffect(() => {
    if (expired) {
      return;
    }
    const interval = setInterval(() => {
      timeInMs.current = end.getTime() - Date.now();
      if (timeInMs.current < 0) {
        setExpired(true);
        clearInterval(interval);
        return;
      }
      setTimeRemaining(formatTimeLeft(timeInMs.current));
    }, secInMs);

    return () => clearInterval(interval);
  }, []);

  let components = [
    <Fragment key="day">{days.toString().padStart(2, '0')}:</Fragment>,
    <Fragment key="hour">{hours.toString().padStart(2, '0')}:</Fragment>,
    <Fragment key="minute">{minutes.toString().padStart(2, '0')}:</Fragment>,
    <Fragment key="second">{seconds.toString().padStart(2, '0')}</Fragment>,
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

  return expired ? (
    <span className="bold">Expired</span>
  ) : (
    <div>{components}</div>
  );
};
