import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db } from '../db.js';
import { decks } from '@leitner/db/schema';
import { and, eq } from 'drizzle-orm';

const DeckCreate = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  isPublic: z.boolean().optional()
});

export async function registerDeckRoutes(app: FastifyInstance) {
  app.get('/v1/decks', { preHandler: [app.authenticate] }, async (req) => {
    const userId = (req.user as any).sub;
    return db.select().from(decks).where(eq(decks.userId, userId));
  });

  app.post('/v1/decks', { preHandler: [app.authenticate] }, async (req) => {
    const userId = (req.user as any).sub;
    const body = DeckCreate.parse(req.body);
    const [d] = await db.insert(decks).values({ ...body, userId }).returning();
    return d;
  });

  app.get('/v1/decks/:id', { preHandler: [app.authenticate] }, async (req, reply) => {
    const userId = (req.user as any).sub;
    const id = (req.params as any).id;
    const [d] = await db.select().from(decks).where(and(eq(decks.id, id), eq(decks.userId, userId)));
    if (!d) return reply.code(404).send({ error: 'Not found' });
    return d;
  });
}
