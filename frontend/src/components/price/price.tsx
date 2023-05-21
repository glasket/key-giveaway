type Properties = {
  price: number;
};

export const Price = ({ price }: Properties) => {
  const priceString = (price / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return <span>{priceString}</span>;
};
