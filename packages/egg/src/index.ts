import path from 'path';
import dotenv from 'dotenv';
import Yarn from './classes/Yarn';
import initializeApi from './api/Api';

let bot: Yarn | undefined;
dotenv.config({
  path: path.join(__dirname, '..', '..')
})

const userIsFunny = false;

bot = new Yarn();
initializeApi();

export { bot }
