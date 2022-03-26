import { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import { bot } from '../../../index';
import { getFluteGangId } from "../../../utils/fgstatic";

const { globals, client } = bot;

interface IGetLeaderboardParams {
  page: string;
}

const GetLeaderboardSchema: FastifySchema = {
  params: {
    type: 'object',
    properties: {
      page: { type: 'number' }
    }
  }
}

const GetLeaderboardHandler = async (req: any, reply: FastifyReply) => {
  const page = req.params["page"];

  const amountRecords = 15
  const offset = parseInt(page) * amountRecords

  const records = await globals.db.ratioBattleResult.groupBy({
    take: 15,
    skip: offset,
    by: ['winnerId'],
    where: {
      guildId: getFluteGangId()
    },
    _count: {
      winnerId: true,
    },
    orderBy: {
      _count: {
        winnerId: "desc"
      }
    },
  })
  
  const _mappedRecords = records.map(async (r) => {
    const fallbackAvatar = "https://cdn.discordapp.com/embed/avatars/0.png"
    let user: {name?: string; avatar?: string;} = {};

    try {
      let temp = await client.users.fetch(r.winnerId);
      user.name = temp.username + "#" + temp.discriminator
      user.avatar = temp.avatarURL({ size: 512, format: "png" }) || fallbackAvatar
    } catch (error) {
      user.name = "Unknown#0000"
      user.avatar = fallbackAvatar
    }

    return {
      "count": r._count.winnerId,
      "id": r.winnerId,
      "user": user
    }
  })

  const mappedRecords = await Promise.all(_mappedRecords)
  return {
    counts: mappedRecords
  };
}

export {
  GetLeaderboardHandler,
  IGetLeaderboardParams
}