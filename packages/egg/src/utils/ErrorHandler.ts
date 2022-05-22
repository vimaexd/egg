import * as Sentry from '@sentry/node';

export const handleErr = (err: any) => {
  console.log(err);
  Sentry.captureException(err);
}