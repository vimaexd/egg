import Discord, { DiscordAPIError } from "discord.js";
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
}