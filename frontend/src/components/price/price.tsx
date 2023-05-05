import styles from './price.module.css';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

type Properties = {
  price: number;
  initialPrice: number;
  discount: number;
};

export const Price = ({ price, initialPrice, discount }: Properties) => {
  const priceString = (price / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  if (discount > 0) {
    const initialPriceString = (initialPrice / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });

    return (
      <>
        <Tippy content={initialPriceString}>
          <span className={styles['discount']}>-{discount}%</span>
        </Tippy>
        <span>{priceString}</span>
      </>
    );
  }
  return (
    <span>
      {(price / 100).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      })}
    </span>
  );
};
