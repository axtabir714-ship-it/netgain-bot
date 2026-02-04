import { db } from "./db";
import { botUsers, botMessages, type BotUser, type BotMessage, type BotMessageWithUser } from "@shared/schema";
import { eq, desc, sql, gte } from "drizzle-orm";

export interface IStorage {
  // User operations
  getBotUser(telegramId: number): Promise<BotUser | undefined>;
  createOrUpdateBotUser(user: Partial<BotUser> & { telegramId: number }): Promise<BotUser>;
  getAllBotUsers(): Promise<BotUser[]>;

  // Message operations
  logMessage(message: { userId: number, messageText: string, direction: "inbound" | "outbound" }): Promise<BotMessage>;
  getRecentMessages(limit?: number): Promise<BotMessageWithUser[]>;

  // Stats
  getStats(): Promise<{ totalUsers: number; totalMessages: number; activeUsers24h: number }>;
}

export class DatabaseStorage implements IStorage {
  async getBotUser(telegramId: number): Promise<BotUser | undefined> {
    const [user] = await db.select().from(botUsers).where(eq(botUsers.telegramId, telegramId));
    return user;
  }

  async createOrUpdateBotUser(userData: Partial<BotUser> & { telegramId: number }): Promise<BotUser> {
    const existing = await this.getBotUser(userData.telegramId);

    if (existing) {
      const [updated] = await db.update(botUsers)
        .set({ ...userData, lastSeen: new Date() })
        .where(eq(botUsers.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(botUsers)
        .values({ ...userData, lastSeen: new Date() } as any) // Type assertion needed for optional fields in insert
        .returning();
      return created;
    }
  }

  async getAllBotUsers(): Promise<BotUser[]> {
    return await db.select().from(botUsers).orderBy(desc(botUsers.lastSeen));
  }

  async logMessage(data: { userId: number, messageText: string, direction: "inbound" | "outbound" }): Promise<BotMessage> {
    const [message] = await db.insert(botMessages).values(data).returning();
    return message;
  }

  async getRecentMessages(limit = 50): Promise<BotMessageWithUser[]> {
    const rows = await db.select({
      message: botMessages,
      user: botUsers,
    })
    .from(botMessages)
    .leftJoin(botUsers, eq(botMessages.userId, botUsers.id))
    .orderBy(desc(botMessages.sentAt))
    .limit(limit);

    return rows.map(row => ({
      ...row.message,
      user: row.user
    }));
  }

  async getStats() {
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(botUsers);
    const [msgCount] = await db.select({ count: sql<number>`count(*)` }).from(botMessages);
    
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [activeUsers] = await db.select({ count: sql<number>`count(*)` })
      .from(botUsers)
      .where(gte(botUsers.lastSeen, oneDayAgo));

    return {
      totalUsers: Number(userCount.count),
      totalMessages: Number(msgCount.count),
      activeUsers24h: Number(activeUsers.count),
    };
  }
}

export const storage = new DatabaseStorage();
