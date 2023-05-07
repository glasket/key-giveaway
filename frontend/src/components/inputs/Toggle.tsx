import styles from './Toggle.module.css';

type Properties = {
  children: JSX.Element | string;
  state: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  className?: string;
};

export const Toggle = ({ children, state, className }: Properties) => {
  const [bool, setBool] = state;
  const classes = [styles['container'], className];

  return (
    <label className={classes.filter((c) => typeof c === 'string').join(' ')}>
      {children}
      <label>
        <input type="checkbox" checked={bool} onChange={() => setBool(!bool)} />
        <div></div>
      </label>
    </label>
  );
};
