import { default as Fastify, FastifyReply, FastifyRequest } from 'fastify';
import Log from '../classes/system/Log';

const log = new Log({prefix: "API"})

export default () => {
  const app = Fastify({
    logger: false
  });

  // allow cross-origin requests
  app.addHook('onRequest', (request: FastifyRequest, reply: FastifyReply, done: () => void) => {
    reply.header("Access-Control-Allow-Origin", "*")
    done()
  })

  app.all('/', async (req, reply) => { return "uwu" })
  // app.register(import('./routes/flutegang/manager'), { prefix: '/v1/flutegang'})

  app.listen(9090, "0.0.0.0", (err, addr) => {
    if(err) throw err;
    log.log(`API listening on ${addr}`)
  })
  return app;
}