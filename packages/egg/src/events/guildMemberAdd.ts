import dayjs from "dayjs";
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

  // Log Channel
  if(g.lgChJoin != "") {
    console.log("log channel")
    try {
      const channel = await member.guild.channels.fetch(g.lgChJoin) as TextChannel;
      channel.send(`<@${member.id}> \`${member.id}\` has joined the server at <t:${Math.floor(member.joinedTimestamp / 1000)}>`)
    } catch(err) { 
      console.log(err)
    }
  }
}