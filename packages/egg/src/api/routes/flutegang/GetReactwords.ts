import { FastifyReply, FastifyRequest } from "fastify";
import { wordBank } from "../../../classes/features/ReactionWords";

const emotes = Object.values(wordBank);

export default async (req: FastifyRequest, reply: FastifyReply) => {
  return {
    words: emotes
  };
}