import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { users } from '@leitner/db/schema';
import { eq } from 'drizzle-orm';

const RegisterBody = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});
const LoginBody = RegisterBody;

export async function registerAuthRoutes(app: FastifyInstance) {
  app.post('/auth/register', async (req, reply) => {
    const body = RegisterBody.parse(req.body);
    const [existing] = await db.select().from(users).where(eq(users.email, body.email));
    if (existing) return reply.code(409).send({ error: 'Email already registered' });

    const hash = await bcrypt.hash(body.password, 10);
    const [u] = await db.insert(users).values({ email: body.email, passwordHash: hash })
      .returning({ id: users.id, email: users.email, passwordHash: users.passwordHash as any });

    // if your users table doesn’t yet have password_hash, add it in schema & here.
    // For brevity, we're skipping that column wiring in this snippet.

    if (!u) return reply.code(500).send({ error: 'User creation failed' });
    const token = app.jwt.sign({ sub: u.id, email: u.email });
    return { token, user: u };
  });

  app.post('/auth/login', async (req, reply) => {
    const body = LoginBody.parse(req.body);
    const [u] = await db.select().from(users).where(eq(users.email, body.email));
    if (!u) return reply.code(401).send({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(body.password, (u as any).passwordHash ?? '');
    if (!ok) return reply.code(401).send({ error: 'Invalid credentials' });

    const token = app.jwt.sign({ sub: u.id, email: u.email });
    return { token, user: { id: u.id, email: u.email } };
  });
}
