import styles from './Card.module.css';

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

export const Card = ({
  headerImages,
  children,
  clickable,
  ...props
}: Properties) => {
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
        <div className={styles['images']}>
          {headerImages.map((i) => (
            <img src={i} />
          ))}
        </div>
      )}
      <div className={styles['content']}>{children}</div>
    </div>
  );
};
