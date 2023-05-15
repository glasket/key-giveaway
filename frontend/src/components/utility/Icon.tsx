import styles from './Icon.module.css';

type Props = {
  icon: icons;
};

export const Icon = ({ icon }: Props) => (
  <span className={`material-symbols-outlined ${styles['icon']}`}>{icon}</span>
);
