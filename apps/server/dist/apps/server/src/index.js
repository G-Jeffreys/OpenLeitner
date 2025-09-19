import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import jwt from '@fastify/jwt';
import pino from 'pino';
import { config } from './config.js';
import { registerAuthRoutes } from './routes/auth.js';
import { registerDeckRoutes } from './routes/decks.js';
import { registerCardRoutes } from './routes/cards.js';
import { registerStudyRoutes } from './routes/study.js';
const app = Fastify({
    logger: { level: 'info' }
});
await app.register(cors, { origin: true, credentials: true });
await app.register(helmet);
await app.register(swagger, {
    openapi: {
        info: { title: 'Leitner Server', version: '1.0.0' }
    }
});
await app.register(swaggerUI, { routePrefix: '/docs' });
await app.register(jwt, { secret: config.jwtSecret });
// simple auth hook
app.decorate('authenticate', async (req, reply) => {
    try {
        await req.jwtVerify();
    }
    catch (e) {
        return reply.code(401).send({ error: 'Unauthorized' });
    }
});
// moved module augmentations to types/augments.d.ts for editor stability
// health
app.get('/health', async () => ({ ok: true }));
// routes
await registerAuthRoutes(app);
await registerDeckRoutes(app);
await registerCardRoutes(app);
await registerStudyRoutes(app);
app.listen({ port: config.port, host: '0.0.0.0' })
    .then(() => app.log.info(`Server on http://localhost:${config.port} (docs at /docs)`))
    .catch((err) => {
    app.log.error(err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map