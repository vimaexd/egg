import { Prisma, Guild, GuildRoleMenuOption, RatioBattleResult } from "@prisma/client";
import { Guild as DiscordGuild } from "discord.js";
import { bot } from '../../index';

type GuildExtras = Guild & {
  roleMenu:  GuildRoleMenuOption[];
  rbResults: RatioBattleResult[];
}

const relatedNodes =  {
  roleMenu: true,
  rbResults: true
}

export default async (target: DiscordGuild): Promise<GuildExtras> => {
  return new Promise(async (res, rej) => {
    let guild = await bot.globals.db.guild.findFirst({
      where: { id: target.id },
      include: relatedNodes
    })
    if(!guild) {
      guild = await bot.globals.db.guild.create({
        data: { id: target.id },
        include: relatedNodes
      })
    }
    res(guild)
  })
}