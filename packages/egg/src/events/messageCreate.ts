import Discord, { DiscordAPIError } from "discord.js";
import { YarnGlobals } from "../utils/types";

import detectRatio from '../utils/ratio';
import getGuild from "../db/utils/getGuild";
import reactionWords from "../utils/reactwords";
import xp from "../classes/Xp";
import achievements from "../classes/Achievements";
import getGuildMember from "../db/utils/getGuildMember";
import dayjs from "dayjs";
import { handleErr } from "../utils/ErrorHandler";

let lastMessage: Discord.Message;

export default async (message: Discord.Message, client: Discord.Client, globals: YarnGlobals) => {
  if(message.channel.type == "DM") return;
  if(message.partial) return;
  
  Object.keys(reactionWords)
    .forEach(async (k) => {
      if(new RegExp(k).test(message.content.toLowerCase())){
        const guild = await getGuild(message.guild);
        if(!guild.rwEnabled) return;
        try {
          await message.react(reactionWords[k]);
        } catch(err) {
          handleErr(err)
        }
      }
    })

  // Reactall Achievement
  const matchedAll = !Object.keys(reactionWords).some((k) => !(new RegExp(k).test(message.content.toLowerCase())));
  if(matchedAll) {
    const profile = await getGuildMember(message.member);
    await achievements.giveAchievement(profile, "eggbot:reactall")
  }

  // Alive Chat Achievement
  if(!lastMessage) lastMessage = message;
  if(dayjs().isAfter(dayjs(lastMessage.createdAt).add(20, 'minute'))) {
    const profile = await getGuildMember(message.member);
    await achievements.giveAchievement(profile, "eggbot:alivechat")
  }
  lastMessage = message;

  detectRatio(message, client, globals);
  xp.runXp(message);
}