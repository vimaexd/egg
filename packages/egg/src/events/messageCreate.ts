import Discord, { DiscordAPIError } from "discord.js";
import { YarnGlobals } from "../utils/types.bot";

import getGuild from "../db/utils/getGuild";
import xp from "../classes/features/Xp";
import achievements from "../classes/system/Achievements";
import getGuildMember from "../db/utils/getGuildMember";
import dayjs from "dayjs";
import { reactionWords, wordBank } from "../classes/features/ReactionWords";
import { ratioBattles } from "../classes/features/RatioBattles";

let lastMessage: Discord.Message;

export default async (message: Discord.Message, client: Discord.Client, globals: YarnGlobals) => {
  if(message.channel.type == "DM") return;
  if(message.partial) return;
  
  reactionWords.runReactionWords(message);
  // reactionWords.runDadJoke(message);
  ratioBattles.runRatio(message, client, globals);

  // Reactall Achievement
  const matchedAll = !Object.keys(wordBank).some((k) => !(new RegExp(k).test(message.content.toLowerCase())));
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

  xp.runXp(message);
}