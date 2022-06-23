import { FastifyReply, FastifyRequest } from "fastify";
import { getFluteGangId } from "../../../static/fluteGang";
import { ratioBattles } from '../../../classes/features/RatioBattles';

export default async (req: FastifyRequest, reply: FastifyReply) => {
  return {
    expires: ratioBattles.recentTimestamp.get(getFluteGangId()) || 0
  };
}