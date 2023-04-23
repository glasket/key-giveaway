import { useRef } from 'react';
import styles from './Card.module.css';
import { useSwipeable } from 'react-swipeable';

type BaseProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

type Omissions = keyof Pick<BaseProps, 'className' | 'style'>;

type Inclusions = {
  headerImages?: readonly [string?, string?, string?];
  clickable?: boolean;
};

type Properties = Omit<BaseProps, Omissions> & Inclusions;

const swipeHandler = (
  children: HTMLCollection,
  next: number,
  current: number
) => {
  if (next !== -1) {
    children[next]?.classList.add(styles['span']!);
  }
  if (current !== -1) {
    children[current]?.classList.remove(styles['span']!);
  }
};

export const Card = ({
  headerImages,
  children,
  clickable,
  ...props
}: Properties) => {
  const focused = useRef(-1);
  const swipes = useSwipeable({
    onSwipedLeft: (evt) => {
      const next =
        focused.current === -1 ? headerImages!.length - 1 : focused.current - 1;
      swipeHandler(
        (evt.event.currentTarget as HTMLDivElement).children,
        next,
        focused.current
      );
      focused.current = next;
    },
    onSwipedRight: (evt) => {
      const next =
        focused.current === headerImages!.length - 1 ? -1 : focused.current + 1;
      swipeHandler(
        (evt.event.currentTarget as HTMLDivElement).children,
        next,
        focused.current
      );
      focused.current = next;
    },
  });

  const hasImages = headerImages !== undefined && headerImages.length > 0;

  const style = `${styles['card']}${
    clickable ? ` ${styles['clickable']}` : ''
  }`;

  return (
    <div
      className={style}
      style={hasImages ? undefined : { gridTemplateRows: '1fr' }}
      {...props}
    >
      {hasImages && (
        <div className={styles['images']} {...swipes}>
          {headerImages.map((i, idx) => (
            <img src={i} key={idx} />
          ))}
        </div>
      )}
      <div className={styles['content']}>{children}</div>
    </div>
  );
};
