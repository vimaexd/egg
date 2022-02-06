import Discord from "discord.js";
import { YarnGlobals } from "../utils/types";

const FUNNY_WORDS: any = {
  "marwan": "<:FlushedMarwan:814408259083304990>",       // marwan
  "nick": "<:SusSpy:806933723576533023>",                // nick
  "^(?=.*\\bskill\\b)(?=.*\\bissue\\b).*$": "💀",        // skill issue
  "get real": "<:skullrealistic:902391812403130408>"     // get real
}

export default async (message: Discord.Message, client: Discord.Client, globals: YarnGlobals) => {
  Object.keys(FUNNY_WORDS)
    .forEach((k) => {
      if(new RegExp(k).test(message.content.toLowerCase())){
        try {
          message.react(FUNNY_WORDS[k]);
        } catch {
          // failed to react :(
        }
      }
    })
}