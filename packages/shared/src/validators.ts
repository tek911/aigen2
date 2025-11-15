import { z } from "zod";

// ============================================================================
// USER VALIDATORS
// ============================================================================

export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be less than 20 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores");

export const emailSchema = z.string().email("Invalid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const registerSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
  username: usernameSchema.optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
});

// ============================================================================
// DEBATE VALIDATORS
// ============================================================================

export const createDebateSchema = z.object({
  topicId: z.string().cuid(),
  format: z.enum(["LIGHTNING", "STANDARD", "DEEP_DIVE", "TEAM_BATTLE"]),
  position: z.string().min(1),
  isPublic: z.boolean().default(true),
  allowSpectators: z.boolean().default(true),
  scheduledAt: z.date().optional(),
});

export const submitArgumentSchema = z.object({
  debateId: z.string().cuid(),
  content: z
    .string()
    .min(10, "Argument must be at least 10 characters")
    .max(1000, "Argument must be less than 1000 characters"),
  sources: z
    .array(
      z.object({
        url: z.string().url(),
        title: z.string().optional(),
      })
    )
    .optional(),
});

export const challengeUserSchema = z.object({
  challengedUserId: z.string().cuid(),
  topicId: z.string().cuid().optional(),
  format: z.enum(["LIGHTNING", "STANDARD", "DEEP_DIVE", "TEAM_BATTLE"]),
  message: z.string().max(500).optional(),
});

// ============================================================================
// VOTING VALIDATORS
// ============================================================================

export const submitVoteSchema = z.object({
  debateId: z.string().cuid(),
  winnerId: z.string().cuid().optional(),
  bestArgumentId: z.string().cuid().optional(),
  bestSourcesUserId: z.string().cuid().optional(),
  mostRespectfulUserId: z.string().cuid().optional(),
  changedMyMind: z.boolean().default(false),
  reasoning: z.string().max(500).optional(),
});

// ============================================================================
// TOPIC VALIDATORS
// ============================================================================

export const createTopicSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(1000),
  category: z.enum([
    "POLITICS",
    "TECHNOLOGY",
    "PHILOSOPHY",
    "SCIENCE",
    "ETHICS",
    "ECONOMICS",
    "SOCIAL_ISSUES",
    "ENVIRONMENT",
    "EDUCATION",
    "HEALTH",
    "CULTURE",
    "SPORTS",
    "OTHER",
  ]),
});

export const updateStanceSchema = z.object({
  topicId: z.string().cuid(),
  position: z.string().min(1),
  confidence: z.number().min(1).max(10),
});

// ============================================================================
// CAMP VALIDATORS
// ============================================================================

export const joinCampSchema = z.object({
  campId: z.string().cuid(),
});

export const submitCampResourceSchema = z.object({
  campId: z.string().cuid(),
  title: z.string().min(1).max(200),
  url: z.string().url(),
  description: z.string().max(1000).optional(),
});

// ============================================================================
// EVIDENCE VALIDATORS
// ============================================================================

export const submitEvidenceSchema = z.object({
  topicId: z.string().cuid(),
  url: z.string().url(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  sourceType: z.enum([
    "ACADEMIC_PAPER",
    "NEWS_ARTICLE",
    "GOVERNMENT_DATA",
    "EXPERT_OPINION",
    "STATISTICAL_DATA",
    "VIDEO",
    "BOOK",
    "OTHER",
  ]),
});

// ============================================================================
// MODERATION VALIDATORS
// ============================================================================

export const reportSchema = z.object({
  reportedType: z.enum(["user", "argument", "debate"]),
  reportedId: z.string().cuid(),
  reason: z.enum([
    "TOXICITY",
    "HARASSMENT",
    "SPAM",
    "MISINFORMATION",
    "OFF_TOPIC",
    "INAPPROPRIATE_CONTENT",
    "BOT_BEHAVIOR",
    "OTHER",
  ]),
  description: z.string().max(1000).optional(),
});

// ============================================================================
// SEARCH & FILTER VALIDATORS
// ============================================================================

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
});

export const searchDebatesSchema = z
  .object({
    topicId: z.string().cuid().optional(),
    format: z.enum(["LIGHTNING", "STANDARD", "DEEP_DIVE", "TEAM_BATTLE"]).optional(),
    status: z.enum(["CHALLENGE_ISSUED", "ACCEPTED", "PREPARATION", "ACTIVE", "VOTING", "COMPLETED", "CANCELLED"]).optional(),
    userId: z.string().cuid().optional(),
  })
  .merge(paginationSchema);

export const searchTopicsSchema = z
  .object({
    category: z
      .enum([
        "POLITICS",
        "TECHNOLOGY",
        "PHILOSOPHY",
        "SCIENCE",
        "ETHICS",
        "ECONOMICS",
        "SOCIAL_ISSUES",
        "ENVIRONMENT",
        "EDUCATION",
        "HEALTH",
        "CULTURE",
        "SPORTS",
        "OTHER",
      ])
      .optional(),
    sortBy: z.enum(["trending", "heat", "recent", "alphabetical"]).default("trending"),
  })
  .merge(paginationSchema);

export const leaderboardSchema = z.object({
  period: z.enum(["DAILY", "WEEKLY", "MONTHLY", "SEASONAL", "ALL_TIME"]).default("ALL_TIME"),
  category: z.string().default("global"),
  limit: z.number().int().positive().max(100).default(50),
});
