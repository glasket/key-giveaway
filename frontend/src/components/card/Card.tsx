import { useRef } from 'react';
import { Game } from '../../Models';
import { headerImageString } from '../../util/steam';
import styles from './Card.module.css';
import { useSwipeable } from 'react-swipeable';
import { Price } from '../price/price';
import { Row } from '../utility/Flex';
import { Review } from '../review/Review';

type BaseProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

type Omissions = keyof Pick<BaseProps, 'style'>;

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
  className,
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

  const cn = [styles['card'], clickable ? styles['clickable'] : '', className]
    .join(' ')
    .trim();

  return (
    <div
      className={cn}
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

export const GameCard = ({ game }: { game: Game }) => (
  <a href={`https://store.steampowered.com/app/${game.appId}`} target="_blank">
    <Card
      clickable
      headerImages={[headerImageString(game.appId)]}
      className={styles['card--game']}
    >
      <div>
        <h4>
          {`${game.name.slice(0, 46).trim()}${
            game.name.length > 45 ? '...' : ''
          }`}
        </h4>
      </div>
      <Row align="center" gap="0.8rem">
        <Price
          price={game.price}
          initialPrice={game.initial_price}
          discount={game.discount}
        />
        <Review score={game.review_score} />
      </Row>
    </Card>
  </a>
);
