// packages/db/schema.ts
import { pgTable, uuid, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
// Users table
export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow(),
});
// Decks table
export const decks = pgTable("decks", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 200 }).notNull(),
    description: varchar("description", { length: 1000 }),
    isPublic: boolean("is_public").default(false),
    createdAt: timestamp("created_at").defaultNow(),
});
// Cards table
export const cards = pgTable("cards", {
    id: uuid("id").primaryKey().defaultRandom(),
    deckId: uuid("deck_id").notNull().references(() => decks.id, { onDelete: "cascade" }),
    front: varchar("front", { length: 8000 }).notNull(),
    back: varchar("back", { length: 8000 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});
// Card state per user for Leitner boxes
export const cardState = pgTable("card_state", {
    id: uuid("id").primaryKey().defaultRandom(),
    cardId: uuid("card_id").notNull().references(() => cards.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    box: integer("box").default(1),
    reps: integer("reps").default(0),
    lapses: integer("lapses").default(0),
    lastReviewedAt: timestamp("last_reviewed_at"),
    nextDueAt: timestamp("next_due_at"),
});
// Review history
export const reviews = pgTable("reviews", {
    id: uuid("id").primaryKey().defaultRandom(),
    cardId: uuid("card_id").notNull().references(() => cards.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    quality: integer("quality").notNull(),
    boxedTo: integer("boxed_to").notNull(),
    latencyMs: integer("latency_ms"),
    createdAt: timestamp("created_at").defaultNow(),
});
