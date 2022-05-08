import path from 'path';
import dotenv from 'dotenv';
import Yarn from './classes/Yarn';
import initializeApi from './api/Api';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';

let bot: Yarn | undefined;
dotenv.config({
  path: path.join(__dirname, '..', '..')
})

if(process.env.SENTRY && process.env.NODE_ENV == "production"){
  Sentry.init({
    dsn: process.env.SENTRY,
    tracesSampleRate: 1.0
  });
}

bot = new Yarn();
initializeApi();

export { bot }