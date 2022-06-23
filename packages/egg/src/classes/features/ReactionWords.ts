import { Message } from "discord.js";
import getGuild from "../../db/utils/getGuild";
import { handleErr } from "../../utils/ErrorHandler";

export const wordBank: {[word: string]: string; } = {
  "marwan": "<:FlushedMarwan:814408259083304990>",       // marwan
  "nick": "<:SusSpy:806933723576533023>",                // nick
  "^(?=.*\\bskill\\b)(?=.*\\bissue\\b).*$": "💀",        // skill issue
  "get real": "<:skullrealistic:902391812403130408>",    // get real
  "[oøu]m+[eaæ]?l+[æea]t+e?": "🍳",                      // omelette
  "rose": "<:dr88:940240705522106448>"                   // rose
}

class ReactionWords {
  async runReactionWords(message: Message) {
    Object.keys(wordBank)
      .forEach(async (k) => {
        if(new RegExp(k).test(message.content.toLowerCase())){
          const guild = await getGuild(message.guild);
          if(!guild.rwEnabled) return;
          try {
            await message.react(wordBank[k]);
          } catch(_) { null }
        }
      })
  }

  async runDadJoke(message: Message) {
    const dadJokeRegex = /(i'm|i am) (.*)/mg
    const regexOut = dadJokeRegex.exec(message.content)
    if(!regexOut) return;

    const guild = await getGuild(message.guild);
    if(!guild.rwDjEnabled) return;

    try {
      message.reply(`hi ${regexOut[2]}`)
    } catch(err) {
      handleErr(err)
    }
  }
}

export const reactionWords = new ReactionWords();