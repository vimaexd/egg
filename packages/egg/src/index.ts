import path from 'path';
import dotenv from 'dotenv';
import Yarn from './classes/Yarn';

let bot: Yarn | undefined;
dotenv.config({
  path: path.join(__dirname, '..', '..')
})


bot = new Yarn();
export { bot }