import { 
  Prisma, 
  Guild, 
  GuildRoleMenuOption, 
  RatioBattleResult,
  GuildMember,
  GuildXPRoleReward,
  GuildXPBlacklistedChannel
} from "@prisma/client";
import { Guild as DiscordGuild } from "discord.js";
import { Haylin as Haylin } from '../../index';

export type GuildExtras = Guild & {
  roleMenu:  GuildRoleMenuOption[];
  rbResults: RatioBattleResult[];
  // members: GuildMember[];
  xpRoleRewards: GuildXPRoleReward[];
  xpBListChan: GuildXPBlacklistedChannel[];
}

const relatedNodes =  {
  roleMenu: true,
  rbResults: true,
  // members: true,
  xpRoleRewards: true,
  xpBListChan: true,
}

export default async (target: DiscordGuild): Promise<GuildExtras> => {
  return new Promise(async (res, rej) => {
    let guild = await Haylin.globals.db.guild.findFirst({
      where: { id: target.id },
      include: relatedNodes
    })
    if(!guild) {
      guild = await Haylin.globals.db.guild.create({
        data: { id: target.id },
        include: relatedNodes
      })
    }
    res(guild)
  })
}