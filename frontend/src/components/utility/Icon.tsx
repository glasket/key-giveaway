import styles from './Icon.module.css';
import { icons } from './Icon.types';

type Props = {
  icon: icons;
};

export const Icon = ({ icon }: Props) => (
  <span className={`material-symbols-outlined ${styles['icon']}`}>{icon}</span>
);
