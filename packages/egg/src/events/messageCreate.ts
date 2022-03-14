import Discord from "discord.js";
import { YarnGlobals } from "../utils/types";

import detectRatio from '../utils/ratio';
import getGuild from "../db/utils/getGuild";

const FUNNY_WORDS: any = {
  "marwan": "<:FlushedMarwan:814408259083304990>",       // marwan
  "nick": "<:SusSpy:806933723576533023>",                // nick
  "^(?=.*\\bskill\\b)(?=.*\\bissue\\b).*$": "💀",        // skill issue
  "get real": "<:skullrealistic:902391812403130408>",    // get real
  "[oøu]m+[eaæ]?l+[æea]t+e?": "🍳",                      // omelette
  "rose": "<:dr88:940240705522106448>"                   // rose
}

export default async (message: Discord.Message, client: Discord.Client, globals: YarnGlobals) => {
  if(message.partial) return;
  
  Object.keys(FUNNY_WORDS)
    .forEach(async (k) => {
      if(new RegExp(k).test(message.content.toLowerCase())){
        const guild = await getGuild(message.guild);
        if(!guild.rwEnabled) return;
        try {
          await message.react(FUNNY_WORDS[k]);
        } catch(err) {
          console.log("reaction failed - " + err)
          // failed to react :(
        }
      }
    })

  detectRatio(message, client, globals);
}