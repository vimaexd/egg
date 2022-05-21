import Discord, { DiscordAPIError, TextChannel } from "discord.js";
import getGuild from "../db/utils/getGuild";
import { YarnGlobals } from "../utils/types";

export default async (member: Discord.GuildMember, client: Discord.Client, globals: YarnGlobals) => {
  const g = await getGuild(member.guild)

  // Auto Assign Roles
  if(g.aaRoleId != "") {
    if(!member.roles.cache.has(g.aaRoleId)) {
      try {
        await member.roles.add(g.aaRoleId)
      } catch(_) { null }
    }
  }

  // Auto Assign Roles
  if(g.lgChJoin != "") {
    try {
      const channel = await member.guild.channels.fetch(g.lgChJoin) as TextChannel;
      channel.send(`<@${member.id}> has joined the server!`)
    } catch(_) { null }
    // if(!member.roles.cache.has(g.aaRoleId)) {
    //   try {
    //     await member.roles.add(g.aaRoleId)
    //   } catch(_) { null }
    // }
  }
}