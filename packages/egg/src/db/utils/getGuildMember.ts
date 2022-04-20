import { 
  GuildMember,
} from "@prisma/client";
import { GuildMember as DiscordGuildMember } from "discord.js";
import { bot } from '../../index';

export default async (target: DiscordGuildMember): Promise<GuildMember> => {
  return new Promise(async (res, rej) => {
    let member = await bot.globals.db.guildMember.findFirst({
      where: { userId: target.id, guildId: target.guild.id },
    })
    if(!member) {
      member = await bot.globals.db.guildMember.create({
        data: { userId: target.id, guildId: target.guild.id },
      })
    }
    res(member)
  })
}