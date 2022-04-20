import Discord from "discord.js";
import { YarnGlobals } from "../utils/types";

import detectRatio from '../utils/ratio';
import getGuild from "../db/utils/getGuild";
import reactionWords from "../utils/reactwords";
import xp from "../classes/Xp";

export default async (message: Discord.Message, client: Discord.Client, globals: YarnGlobals) => {
  if(message.partial) return;
  
  Object.keys(reactionWords)
    .forEach(async (k) => {
      if(new RegExp(k).test(message.content.toLowerCase())){
        const guild = await getGuild(message.guild);
        if(!guild.rwEnabled) return;
        try {
          await message.react(reactionWords[k]);
        } catch(err) {
          console.log("reaction failed - " + err)
          // failed to react :(
        }
      }
    })

  detectRatio(message, client, globals);
  xp.runXp(message);
}