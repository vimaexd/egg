import Discord, { DiscordAPIError } from "discord.js";
import Portal from "../classes/features/Portal";


export default async (oldMessage: Discord.Message, newMessage: Discord.Message) => {  
  Portal.onEdit(oldMessage, newMessage);
}