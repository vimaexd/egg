import Discord, { DiscordAPIError } from "discord.js";
import { YarnGlobals } from "../utils/types.bot";

import getGuild from "../db/utils/getGuild";
import xp from "../classes/features/Xp";
import getGuildMember from "../db/utils/getGuildMember";
import dayjs from "dayjs";
import { reactionWords, wordBank } from "../classes/features/ReactionWords";
import Portal from "../classes/features/Portal";


export default async (message: Discord.Message, client: Discord.Client, globals: YarnGlobals) => {
  if(message.channel.type == "DM") return;
  if(message.partial) return;
  
  reactionWords.runReactionWords(message);
  Portal.onMessage(message);

  xp.runXp(message);
}