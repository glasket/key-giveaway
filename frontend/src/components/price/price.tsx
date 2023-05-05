import styles from './price.module.css';

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
        <span className={styles['discount']}>-{discount}%</span>
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
