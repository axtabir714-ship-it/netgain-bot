import { pgTable, text, serial, integer, boolean, timestamp, bigint } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

// Stores Telegram users who interact with the bot
export const botUsers = pgTable("bot_users", {
  id: serial("id").primaryKey(),
  telegramId: bigint("telegram_id", { mode: "number" }).notNull().unique(),
  username: text("username"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  isBlocked: boolean("is_blocked").default(false),
  lastSeen: timestamp("last_seen").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Stores messages to/from the bot for the dashboard log
export const botMessages = pgTable("bot_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => botUsers.id),
  messageText: text("message_text"),
  direction: text("direction", { enum: ["inbound", "outbound"] }).notNull(), // inbound = from user, outbound = from bot
  sentAt: timestamp("sent_at").defaultNow(),
});

// === RELATIONS ===
export const botUsersRelations = relations(botUsers, ({ many }) => ({
  messages: many(botMessages),
}));

export const botMessagesRelations = relations(botMessages, ({ one }) => ({
  user: one(botUsers, {
    fields: [botMessages.userId],
    references: [botUsers.id],
  }),
}));

// === BASE SCHEMAS ===
export const insertBotUserSchema = createInsertSchema(botUsers).omit({ id: true, createdAt: true, lastSeen: true });
export const insertBotMessageSchema = createInsertSchema(botMessages).omit({ id: true, sentAt: true });

// === EXPLICIT API CONTRACT TYPES ===

export type BotUser = typeof botUsers.$inferSelect;
export type BotMessage = typeof botMessages.$inferSelect;

export type BotMessageWithUser = BotMessage & {
  user: BotUser | null;
};

// Response types
export type StatsResponse = {
  totalUsers: number;
  totalMessages: number;
  activeUsers24h: number;
};

export type LogsResponse = BotMessageWithUser[];
