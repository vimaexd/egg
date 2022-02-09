import Discord from "discord.js";
import dayjs from "dayjs";
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import { YarnGlobals } from "../utils/types";

dayjs.extend(timezone);
dayjs.extend(utc);

const events = {
	MESSAGE_REACTION_ADD: 'messageReactionAdd'
};

export default async (event: any, client: Discord.Client, globals: YarnGlobals) => {
	if (!events.hasOwnProperty(event.t)) return;

    try {
        const { d: data } = event;
        const user = await client.users.fetch(data.user_id);
        const channel = await client.channels.fetch(data.channel_id) as Discord.TextChannel
    
        const message = await channel.messages.fetch(data.message_id);
        const snowflake = event.d.emoji.id ? `${event.d.emoji.name}:${event.d.emoji.id}` : event.d.emoji.name
        const reaction = message.reactions.resolve(snowflake)
        const emoji = client.emojis.resolve(event.d.emoji.id)
    
        let log_channel_id = "828313521749098527";
        let log_channel = reaction.message.guild.channels.cache.get(log_channel_id) as Discord.TextChannel;
    
        let link = `https://discord.com/channels/${reaction.message.guild.id}/${reaction.message.channel.id}/${reaction.message.id}`
        let emoji_link = `https://cdn.discordapp.com/emojis/${event.d.emoji.id}.png`
    
        let emojEmbed = new Discord.MessageEmbed()
            .setAuthor({
              name: user.username + "#" + user.discriminator + ` (${user.id})`, 
              iconURL: user.displayAvatarURL()
            })
            .setDescription(`Reacted with [:${event.d.emoji.name}:](${emoji_link}) on [this message](${link})`)
            .setFooter({
              text: `${dayjs.tz(dayjs(), "Europe/Oslo").format('HH:mm:ss DD/MM/YYYY')}`
            })
    
        await log_channel.send({embeds: [emojEmbed]})
    } catch(err) {
      console.log("react log failed - " + err)
    }
}