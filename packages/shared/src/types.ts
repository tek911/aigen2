// ============================================================================
// DEBATE TYPES
// ============================================================================

export interface DebateSettings {
  turnDuration: number; // seconds
  maxTurns: number;
  isPublic: boolean;
  allowSpectators: boolean;
}

export interface DebateTimer {
  currentTurn: number;
  timeRemaining: number;
  currentPlayer: string;
  isPaused: boolean;
}

export interface LiveDebateState {
  debateId: string;
  status: string;
  participants: Array<{
    userId: string;
    username: string;
    position: string;
    isOnline: boolean;
  }>;
  currentTurn: number;
  timer: DebateTimer;
  spectatorCount: number;
}

// ============================================================================
// AI ANALYSIS TYPES
// ============================================================================

export interface ToxicityAnalysis {
  score: number; // 0-1
  categories: {
    hate: number;
    harassment: number;
    selfHarm: number;
    sexual: number;
    violence: number;
  };
  isToxic: boolean;
}

export interface LogicalFallacy {
  type: string;
  description: string;
  location: {
    start: number;
    end: number;
  };
  severity: "low" | "medium" | "high";
}

export interface ArgumentQuality {
  structure: number; // 0-100
  clarity: number;
  evidence: number;
  reasoning: number;
  overall: number;
}

export interface FactCheckResult {
  claim: string;
  verdict: "TRUE" | "MOSTLY_TRUE" | "PARTLY_TRUE" | "MOSTLY_FALSE" | "FALSE" | "UNVERIFIABLE";
  confidence: number;
  explanation: string;
  sources: Array<{
    url: string;
    title: string;
    credibility: number;
  }>;
}

export interface DebateAnalysis {
  winner: {
    userId: string;
    confidence: number;
  };
  scores: {
    [userId: string]: {
      argumentStructure: number;
      evidenceQuality: number;
      rhetoricEffectiveness: number;
      logicalConsistency: number;
      overall: number;
    };
  };
  commonGround: string[];
  keyDisagreements: string[];
  highlights: Array<{
    timestamp: Date;
    description: string;
    type: "strong_argument" | "fallacy" | "mind_change" | "common_ground";
  }>;
  suggestions: string[];
}

// ============================================================================
// USER TYPES
// ============================================================================

export interface UserProfile {
  id: string;
  username: string;
  avatar: string | null;
  eloRating: number;
  level: number;
  credibilityScore: number;
  badges: Array<{
    code: string;
    name: string;
    icon: string;
    rarity: string;
  }>;
  stats: {
    totalDebates: number;
    wins: number;
    losses: number;
    draws: number;
    winRate: number;
  };
}

export interface ProgressionData {
  currentLevel: number;
  currentXp: number;
  xpForNextLevel: number;
  xpProgress: number; // percentage
  unlockedAchievements: number;
  totalAchievements: number;
}

// ============================================================================
// REAL-TIME TYPES
// ============================================================================

export interface SocketEvent {
  type: string;
  payload: unknown;
  timestamp: Date;
}

export interface TypingIndicator {
  userId: string;
  username: string;
  isTyping: boolean;
}

export interface SpectatorReaction {
  type: "fire" | "thinking" | "mindblown" | "clap" | "question";
  count: number;
  recentUsers: string[];
}

export interface PresenceUpdate {
  userId: string;
  status: "online" | "away" | "offline";
  lastSeen: Date;
}

// ============================================================================
// MATCHING & DISCOVERY TYPES
// ============================================================================

export interface MatchCriteria {
  topicId?: string;
  format: string;
  eloRange: {
    min: number;
    max: number;
  };
  timezone?: string;
  preferredTime?: Date;
}

export interface MatchSuggestion {
  opponentId: string;
  opponent: UserProfile;
  topicId: string;
  topic: {
    title: string;
    category: string;
  };
  matchQuality: number; // 0-100
  reason: string;
}

export interface FeedItem {
  id: string;
  type: "debate" | "highlight" | "achievement" | "mind_change";
  timestamp: Date;
  priority: number;
  data: unknown;
}

// ============================================================================
// GAMIFICATION TYPES
// ============================================================================

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  tier: string;
  xpReward: number;
  progress?: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
}

export interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  earnedAt?: Date;
  isEquipped: boolean;
}

export interface DailyChallengeData {
  id: string;
  date: Date;
  challengeType: string;
  description: string;
  requirement: unknown;
  xpReward: number;
  progress: number;
  isCompleted: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar: string | null;
  score: number;
  change: number; // rank change from previous period
  badges: string[];
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface FileUpload {
  filename: string;
  url: string;
  size: number;
  mimeType: string;
}
