import { FastifyReply, FastifyRequest } from "fastify";
import { getFluteGangId } from "../../../utils/fgstatic";
import { lastRatioTimestamp } from '../../../utils/ratio';

export default async (req: FastifyRequest, reply: FastifyReply) => {
  return {
    expires: lastRatioTimestamp.get(getFluteGangId()) || 0
  };
}