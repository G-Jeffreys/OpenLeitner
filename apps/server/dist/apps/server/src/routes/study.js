import { z } from 'zod';
import { db } from '../db.js';
import { cards, cardState, decks, reviews } from '@leitner/db/schema';
import { and, eq, isNull, lte, or, sql } from 'drizzle-orm';
import { addDays } from 'date-fns';
const QueueQuery = z.object({
    deckId: z.string().uuid(),
    limit: z.coerce.number().int().min(1).max(100).default(50)
});
const ReviewBody = z.object({
    cardId: z.string().uuid(),
    quality: z.number().int().min(0).max(3),
    latencyMs: z.number().int().optional()
});
const MAX_BOX = 5;
const INTERVALS = { 1: 0, 2: 1, 3: 3, 4: 7, 5: 21 }; // days
function applyLeitnerUpdate(prevBox, quality) {
    const up = quality >= 2;
    const nextBox = up ? Math.min(prevBox + 1, MAX_BOX) : 1;
    const days = INTERVALS[nextBox] ?? 0;
    const nextDueAt = addDays(new Date(), days);
    return { nextBox, nextDueAt };
}
export async function registerStudyRoutes(app) {
    app.get('/v1/study/queue', { preHandler: [app.authenticate] }, async (req, reply) => {
        const userId = req.user.sub;
        const { deckId, limit } = QueueQuery.parse(req.query);
        // Verify deck ownership
        const [d] = await db.select().from(decks).where(and(eq(decks.id, deckId), eq(decks.userId, userId)));
        if (!d)
            return reply.code(404).send({ error: 'Deck not found' });
        // Left-join card_state to treat missing state as "due now"
        const now = new Date();
        const rows = await db.execute(sql `
      select c.id, c.front as "frontMd", c.back as "backMd",
             cs.box, cs.next_due_at as "nextDueAt"
      from ${cards} c
      left join ${cardState} cs
        on cs.card_id = c.id and cs.user_id = ${userId}
      where c.deck_id = ${deckId}
        and (cs.next_due_at <= ${now} or cs.next_due_at is null)
      order by coalesce(cs.next_due_at, to_timestamp(0)) asc
      limit ${limit}
    `);
        return rows.rows;
    });
    app.post('/v1/study/review', { preHandler: [app.authenticate] }, async (req, reply) => {
        const userId = req.user.sub;
        const { cardId, quality, latencyMs } = ReviewBody.parse(req.body);
        // Find existing state
        const [state] = await db.select().from(cardState)
            .where(and(eq(cardState.cardId, cardId), eq(cardState.userId, userId)));
        const prevBox = state?.box ?? 1;
        const { nextBox, nextDueAt } = applyLeitnerUpdate(prevBox, quality);
        if (state) {
            await db.update(cardState)
                .set({ box: nextBox, reps: (state.reps ?? 0) + 1, lastReviewedAt: new Date(), nextDueAt })
                .where(eq(cardState.id, state.id));
        }
        else {
            await db.insert(cardState).values({
                cardId, userId, box: nextBox, reps: 1, lapses: quality < 2 ? 1 : 0, lastReviewedAt: new Date(), nextDueAt
            });
        }
        await db.insert(reviews).values({
            cardId, userId, quality, boxedTo: nextBox, latencyMs: latencyMs ?? null
        });
        return { cardId, boxedTo: nextBox, nextDueAt };
    });
}
//# sourceMappingURL=study.js.map