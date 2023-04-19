import { ReactNode } from 'react';
import styles from './Flex.module.css';

type FlexProps = {
  children: ReactNode;
  direction: 'row' | 'column';
  wrap?: boolean;
  justify?:
    | 'start'
    | 'end'
    | 'center'
    | 'between'
    | 'around'
    | 'evenly'
    | 'stretch';
  align?: 'start' | 'end' | 'center' | 'stretch';
  gap?: string;
  className?: string | undefined;
  Element?: 'div' | 'ul' | 'span' | 'article' | 'section';
};

export const Flex = ({
  children,
  direction,
  wrap,
  justify,
  align,
  gap,
  className,
  Element = 'div',
}: FlexProps) => (
  <Element
    className={`flex
    ${styles[direction ?? 'row']}
    ${styles[wrap ? 'wrap' : 'nowrap']}
    ${styles[`align-${align ?? 'stretch'}`]}
    ${styles[`justify-${justify ?? 'stretch'}`]}
    ${className ?? ''}
    `}
    style={{ gap: gap }}
  >
    {children}
  </Element>
);

export const Row = ({ children, ...props }: Omit<FlexProps, 'direction'>) => (
  <Flex {...props} direction="row">
    {children}
  </Flex>
);

export const Column = ({
  children,
  ...props
}: Omit<FlexProps, 'direction'>) => (
  <Flex {...props} direction="column">
    {children}
  </Flex>
);
