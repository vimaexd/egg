import { FastifyReply, FastifyRequest } from "fastify";
import { getFluteGangId } from "../../../utils/fgstatic";
import { lastRatioTimestamp } from '../../../utils/ratio';
import reactionWords from "../../../utils/reactwords";

const emotes = Object.values(reactionWords);

export default async (req: FastifyRequest, reply: FastifyReply) => {
  return {
    words: emotes
  };
}