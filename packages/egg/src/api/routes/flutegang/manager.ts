import { FastifyInstance, FastifyPluginOptions } from "fastify"

import GetCooldown from './GetCooldown';
import { GetLeaderboardHandler, IGetLeaderboardParams }from "./GetLeaderboard";

export default (fastify: FastifyInstance, opts: FastifyPluginOptions, done: () => void) => {
  fastify.get('/cooldown', GetCooldown);
  fastify.get<{
    Params: IGetLeaderboardParams
  }>('/leaderboard/:page', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number' }
        }
      }
    }
  }, GetLeaderboardHandler);

  done();
}