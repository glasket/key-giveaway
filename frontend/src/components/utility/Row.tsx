import { CSSProperties, ReactNode } from 'react';

const style: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
};

type Props = {
  children: ReactNode;
};

export const Row = ({ children }: Props) => <div style={style}>{children}</div>;
