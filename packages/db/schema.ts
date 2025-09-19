// packages/db/schema.ts
import { pgTable, uuid, varchar, timestamp, boolean } from "drizzle-orm/pg-core";

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
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
