import path from 'path';
import dotenv from 'dotenv';
import BotInstance from './classes/Haylin';
import initializeApi from './api/Api';

let Haylin: BotInstance | undefined;
dotenv.config({
  path: path.join(__dirname, '..', '..', '..', '.env')
})


Haylin = new BotInstance();
// initializeApi();

export { Haylin }
