import * as Sentry from '@sentry/node';

export const handleErr = (err: any) => {
  Sentry.captureException(err);
}