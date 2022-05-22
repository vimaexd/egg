import dayjs from "dayjs";
import Discord from "discord.js";
import getGuild from "../db/utils/getGuild";
import { YarnGlobals } from "../utils/types";

export default async (reaction: Discord.MessageReaction, user: Discord.User, client: Discord.Client, globals: YarnGlobals) => {
  const message = await reaction.message.fetch();
  const guildProfile = await getGuild(message.guild)
  
  if(guildProfile.lgChReact != "") {
    let logChannelId = guildProfile.lgChReact;
    let logChannel = message.guild.channels.cache.get(logChannelId) as Discord.TextChannel;

    let link = `https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`
    let emojiLink = (reaction.emoji.id != null) ? `https://cdn.discordapp.com/emojis/${reaction.emoji.id}.png` : "";

    let formattedEmojiName = (reaction.emoji.name.startsWith(":")) ? `${reaction.emoji.name}` : `\:${reaction.emoji.name}\:`; 
    let content = `<@${user.id}> \`${user.id}\` reacted with [${formattedEmojiName}](${emojiLink}) on [this message](${link}) at <t:${dayjs().unix()}>` 

    logChannel.send({content, allowedMentions: {parse: []}})
      .catch(console.log)
  }
}