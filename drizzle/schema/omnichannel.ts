import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./auth";
import { customers, leads } from "./crm";
import { onlineOrders } from "./online-sales";

// ─── Channel Accounts (Fanpage, Zalo OA) ────────────────────────────
export const channelAccounts = pgTable("channel_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  name: text("name").notNull(), // Tên Fanpage, Zalo OA
  channelType: text("channel_type").notNull(), // facebook, zalo, website
  externalAccountId: text("external_account_id"), // Page ID, OA ID
  status: text("status").notNull().default("active"), // active, disconnected
  accessToken: text("access_token"), // Encrypted placeholder
  webhookVerifyToken: text("webhook_verify_token"), // Secret key for webhook verification
  settings: jsonb("settings"), // Configs like autoCreateLead
  connectedBy: uuid("connected_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Conversations ──────────────────────────────────────────────────
export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  channelAccountId: uuid("channel_account_id").references(() => channelAccounts.id),
  channelType: text("channel_type").notNull(), // facebook, zalo, website
  externalConversationId: text("external_conversation_id"), // Conversation ID từ nền tảng
  externalParticipantId: text("external_participant_id"), // PSID, Zalo User ID
  participantName: text("participant_name"),
  participantAvatar: text("participant_avatar"),
  participantPhone: text("participant_phone"),
  status: text("status").notNull().default("new"), // new, in_progress, need_reply, closed, spam
  leadId: uuid("lead_id").references(() => leads.id),
  customerId: uuid("customer_id").references(() => customers.id),
  orderId: uuid("order_id").references(() => onlineOrders.id),
  assignedTo: uuid("assigned_to").references(() => users.id),
  lastMessageContent: text("last_message_content"),
  lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Conversation Messages ──────────────────────────────────────────
export const conversationMessages = pgTable("conversation_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id),
  externalMessageId: text("external_message_id"),
  senderType: text("sender_type").notNull(), // customer, agent, bot
  senderId: text("sender_id"), // user_id or psid
  content: text("content"),
  attachments: jsonb("attachments"), // Array of file urls
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Webhook Events ─────────────────────────────────────────────────
export const webhookEvents = pgTable("webhook_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  channelType: text("channel_type").notNull(), // facebook, zalo
  eventType: text("event_type"), // message, comment, etc.
  payload: jsonb("payload"), // Raw payload
  status: text("status").notNull().default("received"), // received, parsed, processed, failed, ignored
  errorLog: text("error_log"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Web Form Submissions ───────────────────────────────────────────
export const webFormSubmissions = pgTable("web_form_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  company: text("company"),
  need: text("need"), // Nhu cầu
  sourceUrl: text("source_url"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  status: text("status").notNull().default("new"), // new, converted, spam
  leadId: uuid("lead_id").references(() => leads.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Relations ──────────────────────────────────────────────────────
export const channelAccountsRelations = relations(channelAccounts, ({ one, many }) => ({
  connectedByUser: one(users, {
    fields: [channelAccounts.connectedBy],
    references: [users.id],
  }),
  conversations: many(conversations),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  channelAccount: one(channelAccounts, {
    fields: [conversations.channelAccountId],
    references: [channelAccounts.id],
  }),
  assignedToUser: one(users, {
    fields: [conversations.assignedTo],
    references: [users.id],
  }),
  lead: one(leads, {
    fields: [conversations.leadId],
    references: [leads.id],
  }),
  customer: one(customers, {
    fields: [conversations.customerId],
    references: [customers.id],
  }),
  order: one(onlineOrders, {
    fields: [conversations.orderId],
    references: [onlineOrders.id],
  }),
  messages: many(conversationMessages),
}));

export const conversationMessagesRelations = relations(conversationMessages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [conversationMessages.conversationId],
    references: [conversations.id],
  }),
}));

export const webFormSubmissionsRelations = relations(webFormSubmissions, ({ one }) => ({
  lead: one(leads, {
    fields: [webFormSubmissions.leadId],
    references: [leads.id],
  }),
}));
