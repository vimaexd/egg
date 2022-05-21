import { 
  GuildMember, GuildMemberAchievement,
} from "@prisma/client";
import { GuildMember as DiscordGuildMember } from "discord.js";
import { Haylin as Haylin } from '../../index';

type GuildMemberExtras = GuildMember & {
  achievements: GuildMemberAchievement[];
}

const relatedNodes = {
  achievements: true
}

export {
  GuildMemberExtras
}

export default async (target: DiscordGuildMember): Promise<GuildMemberExtras> => {
  return new Promise(async (res, rej) => {
    let member = await Haylin.globals.db.guildMember.findFirst({
      where: { userId: target.id, guildId: target.guild.id },
      include: relatedNodes
    })
    if(!member) {
      member = await Haylin.globals.db.guildMember.create({
        data: { userId: target.id, guildId: target.guild.id },
        include: relatedNodes
      })
    }
    res(member)
  })
}