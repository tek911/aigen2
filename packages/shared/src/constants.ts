// ============================================================================
// DEBATE CONSTANTS
// ============================================================================

export const DEBATE_FORMATS = {
  LIGHTNING: {
    name: "Lightning",
    description: "5 minutes, 30-second turns",
    duration: 300, // seconds
    turnDuration: 30,
    maxTurns: 10,
  },
  STANDARD: {
    name: "Standard",
    description: "30 minutes, 2-minute turns",
    duration: 1800,
    turnDuration: 120,
    maxTurns: 15,
  },
  DEEP_DIVE: {
    name: "Deep Dive",
    description: "7 days, daily exchanges",
    duration: 604800,
    turnDuration: 86400,
    maxTurns: 14,
  },
  TEAM_BATTLE: {
    name: "Team Battle",
    description: "3v3, coordinated arguments",
    duration: 2700,
    turnDuration: 180,
    maxTurns: 15,
  },
} as const;

// ============================================================================
// ELO & PROGRESSION CONSTANTS
// ============================================================================

export const ELO_CONSTANTS = {
  STARTING_RATING: 1200,
  K_FACTOR: 32,
  K_FACTOR_PROVISIONAL: 40, // Higher K for new players
  PROVISIONAL_GAMES: 10,
  MIN_RATING: 100,
  MAX_RATING: 3000,
} as const;

export const LEVEL_CONSTANTS = {
  BASE_XP: 100,
  XP_MULTIPLIER: 1.5,
  MAX_LEVEL: 100,
} as const;

export const XP_REWARDS = {
  DEBATE_PARTICIPATION: 50,
  DEBATE_WIN: 100,
  DEBATE_LOSS: 25,
  QUALITY_ARGUMENT: 20,
  SOURCE_CITED: 10,
  FACT_CHECK_PASSED: 15,
  MIND_CHANGED: 200,
  VOTE_CAST: 5,
  DAILY_LOGIN: 10,
} as const;

// ============================================================================
// CREDIBILITY CONSTANTS
// ============================================================================

export const CREDIBILITY_WEIGHTS = {
  WIN_RATE: 0.3,
  SOURCE_USAGE: 0.2,
  FACT_CHECKS: 0.2,
  RESPECT_SCORE: 0.15,
  LONGEVITY: 0.1,
  COMMUNITY_VOTES: 0.05,
} as const;

export const TOXICITY_THRESHOLDS = {
  WARNING: 0.3,
  SHADOWBAN: 0.6,
  BAN: 0.85,
} as const;

// ============================================================================
// GAMIFICATION CONSTANTS
// ============================================================================

export const ACHIEVEMENT_TIERS = {
  BRONZE: { color: "#CD7F32", multiplier: 1 },
  SILVER: { color: "#C0C0C0", multiplier: 1.5 },
  GOLD: { color: "#FFD700", multiplier: 2 },
  PLATINUM: { color: "#E5E4E2", multiplier: 3 },
  DIAMOND: { color: "#B9F2FF", multiplier: 5 },
} as const;

export const BADGE_RARITIES = {
  COMMON: { color: "#9CA3AF", dropRate: 0.5 },
  RARE: { color: "#3B82F6", dropRate: 0.25 },
  EPIC: { color: "#8B5CF6", dropRate: 0.15 },
  LEGENDARY: { color: "#F59E0B", dropRate: 0.05 },
} as const;

// ============================================================================
// RATE LIMITING
// ============================================================================

export const RATE_LIMITS = {
  DEBATE_CREATION: {
    points: 5,
    duration: 3600, // 1 hour
  },
  ARGUMENT_SUBMISSION: {
    points: 30,
    duration: 60, // 1 minute
  },
  VOTE_SUBMISSION: {
    points: 20,
    duration: 300, // 5 minutes
  },
  REPORT_SUBMISSION: {
    points: 10,
    duration: 3600,
  },
  API_GENERAL: {
    points: 100,
    duration: 60,
  },
} as const;

// ============================================================================
// CONTENT LIMITS
// ============================================================================

export const CONTENT_LIMITS = {
  USERNAME_MIN: 3,
  USERNAME_MAX: 20,
  BIO_MAX: 500,
  ARGUMENT_MIN: 10,
  ARGUMENT_MAX: 1000,
  TOPIC_TITLE_MAX: 200,
  TOPIC_DESCRIPTION_MAX: 1000,
  VOTE_REASONING_MAX: 500,
  REPORT_DESCRIPTION_MAX: 1000,
} as const;

// ============================================================================
// TIME CONSTANTS
// ============================================================================

export const TIME_CONSTANTS = {
  CHALLENGE_EXPIRY: 86400, // 24 hours
  DEBATE_PREPARATION: 300, // 5 minutes
  VOTE_PERIOD: 3600, // 1 hour
  NOTIFICATION_RETENTION: 2592000, // 30 days
  SESSION_DURATION: 604800, // 7 days
} as const;

// ============================================================================
// REAL-TIME CONSTANTS
// ============================================================================

export const SOCKET_EVENTS = {
  // Connection
  CONNECT: "connect",
  DISCONNECT: "disconnect",

  // Debate
  DEBATE_JOIN: "debate:join",
  DEBATE_LEAVE: "debate:leave",
  DEBATE_START: "debate:start",
  DEBATE_END: "debate:end",
  DEBATE_UPDATE: "debate:update",

  // Arguments
  ARGUMENT_SUBMIT: "argument:submit",
  ARGUMENT_RECEIVED: "argument:received",

  // Typing
  TYPING_START: "typing:start",
  TYPING_STOP: "typing:stop",

  // Reactions
  REACTION_ADD: "reaction:add",
  REACTION_UPDATE: "reaction:update",

  // Spectators
  SPECTATOR_JOIN: "spectator:join",
  SPECTATOR_LEAVE: "spectator:leave",
  SPECTATOR_COUNT: "spectator:count",

  // Notifications
  NOTIFICATION_NEW: "notification:new",
  NOTIFICATION_READ: "notification:read",

  // Presence
  PRESENCE_UPDATE: "presence:update",
} as const;

// ============================================================================
// AI CONSTANTS
// ============================================================================

export const AI_MODELS = {
  CLAUDE_SONNET: "anthropic.claude-3-sonnet-20240229-v1:0",
  CLAUDE_HAIKU: "anthropic.claude-3-haiku-20240307-v1:0",
} as const;

export const AI_PROMPTS = {
  NEUTRAL_BRIEFING: "neutral-briefing",
  ARGUMENT_ANALYSIS: "argument-analysis",
  FACT_CHECK: "fact-check",
  TOXICITY_CHECK: "toxicity-check",
  FALLACY_DETECTION: "fallacy-detection",
  DEBATE_SUMMARY: "debate-summary",
  WINNER_DETERMINATION: "winner-determination",
} as const;

// ============================================================================
// CACHE KEYS
// ============================================================================

export const CACHE_KEYS = {
  USER_PROFILE: (userId: string) => `user:profile:${userId}`,
  TOPIC_TRENDING: "topics:trending",
  LEADERBOARD: (period: string, category: string) => `leaderboard:${period}:${category}`,
  DEBATE_LIVE: (debateId: string) => `debate:live:${debateId}`,
  USER_STATS: (userId: string) => `user:stats:${userId}`,
} as const;

export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const;
