import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db } from '../db.js';
import { decks, cards } from '@leitner/db/schema';
import { and, eq } from 'drizzle-orm';

const CardCreate = z.object({
  front: z.string().min(1),
  back: z.string().min(1)
});

export async function registerCardRoutes(app: FastifyInstance) {
  app.get('/v1/decks/:deckId/cards', { preHandler: [app.authenticate] }, async (req, reply) => {
    const userId = (req.user as any).sub;
    const deckId = (req.params as any).deckId;
    const [d] = await db.select().from(decks).where(and(eq(decks.id, deckId), eq(decks.userId, userId)));
    if (!d) return reply.code(404).send({ error: 'Deck not found' });
    return db.select().from(cards).where(eq(cards.deckId, deckId));
  });

  app.post('/v1/decks/:deckId/cards', { preHandler: [app.authenticate] }, async (req, reply) => {
    const userId = (req.user as any).sub;
    const deckId = (req.params as any).deckId;
    const [d] = await db.select().from(decks).where(and(eq(decks.id, deckId), eq(decks.userId, userId)));
    if (!d) return reply.code(404).send({ error: 'Deck not found' });

    const body = CardCreate.parse(req.body);
    const [c] = await db.insert(cards).values({ deckId, front: body.front, back: body.back }).returning();
    return c;
  });
}
