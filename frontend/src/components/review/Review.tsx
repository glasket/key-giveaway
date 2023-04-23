export const Review = ({ score }: { score: number }) => {
  // Using the Metacritic Scale (https://www.metacritic.com/about-metascores)
  let color;
  if (score >= 75) {
    color = 'green';
  } else if (score >= 50) {
    color = '#d92';
  } else {
    color = '#d00';
  }

  return (
    <span
      style={{
        color: 'white',
        backgroundColor: color,
        padding: '0.5rem',
        borderRadius: '6px',
        lineHeight: '1',
      }}
    >
      {score}
    </span>
  );
};
