import 'fastify';
import '@fastify/jwt';

declare module 'fastify' {
	interface FastifyInstance { authenticate: any }
}

declare module '@fastify/jwt' {
	interface FastifyJWT {
		user: { sub: string; email?: string }
	}
}


