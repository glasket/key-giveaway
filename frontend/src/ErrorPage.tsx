import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

const ErrorPage = () => {
  const error = useRouteError();
  console.error(error);

  let message;

  if (isRouteErrorResponse(error)) {
    message = error.statusText;
  } else {
    message = (error as any).message ?? 'Unknown Error';
  }

  return (
    <div>
      <h1>Sorry!</h1>
      <p>An unexpected error occurred.</p>
      <p>{message}</p>
    </div>
  );
};

export { ErrorPage };
