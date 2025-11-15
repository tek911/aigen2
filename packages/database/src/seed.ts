import { PrismaClient, Category, DebateFormat, AchievementTier, BadgeRarity } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create Achievements
  const achievements = [
    {
      code: "FIRST_BLOOD",
      name: "First Blood",
      description: "Win your first debate",
      icon: "🎯",
      xpReward: 100,
      tier: AchievementTier.BRONZE,
      requirement: { type: "wins", count: 1 },
    },
    {
      code: "DEVILS_ADVOCATE",
      name: "Devil's Advocate",
      description: "Win a debate arguing against your personal belief",
      icon: "😈",
      xpReward: 250,
      tier: AchievementTier.SILVER,
      requirement: { type: "opposite_stance_win", count: 1 },
    },
    {
      code: "FACT_CHECKER",
      name: "Fact Checker",
      description: "Submit 50 verified sources",
      icon: "📚",
      xpReward: 300,
      tier: AchievementTier.GOLD,
      requirement: { type: "verified_sources", count: 50 },
    },
    {
      code: "MIND_OPENER",
      name: "Mind Opener",
      description: "Change your stance 5 times based on evidence",
      icon: "🧠",
      xpReward: 500,
      tier: AchievementTier.GOLD,
      requirement: { type: "mind_changes", count: 5 },
    },
    {
      code: "PEACEMAKER",
      name: "Peacemaker",
      description: "Find common ground in 10 debates",
      icon: "🕊️",
      xpReward: 200,
      tier: AchievementTier.SILVER,
      requirement: { type: "common_ground", count: 10 },
    },
    {
      code: "IRON_DEBATER",
      name: "Iron Debater",
      description: "Maintain a 30-day debate streak",
      icon: "🔥",
      xpReward: 1000,
      tier: AchievementTier.PLATINUM,
      requirement: { type: "streak", count: 30 },
    },
    {
      code: "GRANDMASTER",
      name: "Grandmaster",
      description: "Reach ELO 2000",
      icon: "👑",
      xpReward: 2000,
      tier: AchievementTier.DIAMOND,
      requirement: { type: "elo", count: 2000 },
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { code: achievement.code },
      update: achievement,
      create: achievement,
    });
  }

  console.log("✅ Created achievements");

  // Create Badges
  const badges = [
    {
      code: "VERIFIED",
      name: "Verified Debater",
      description: "Email verified and completed onboarding",
      icon: "✓",
      rarity: BadgeRarity.COMMON,
    },
    {
      code: "SOURCE_MASTER",
      name: "Source Master",
      description: "Exceptional source citation record",
      icon: "📖",
      rarity: BadgeRarity.RARE,
    },
    {
      code: "RESPECTFUL",
      name: "Respectful Debater",
      description: "Consistently respectful in debates",
      icon: "🤝",
      rarity: BadgeRarity.RARE,
    },
    {
      code: "MIND_CHANGER",
      name: "Mind Changer",
      description: "Changed opponents' minds multiple times",
      icon: "💡",
      rarity: BadgeRarity.EPIC,
    },
    {
      code: "LEGENDARY_DEBATER",
      name: "Legendary Debater",
      description: "Top 1% of all debaters",
      icon: "⭐",
      rarity: BadgeRarity.LEGENDARY,
    },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { code: badge.code },
      update: badge,
      create: badge,
    });
  }

  console.log("✅ Created badges");

  // Create Sample Topics
  const topics = [
    {
      title: "Should abortion be legal?",
      slug: "abortion-legality",
      description: "Debate the legal and ethical aspects of abortion rights",
      category: Category.SOCIAL_ISSUES,
      heat: 85.5,
      trendingScore: 92.0,
    },
    {
      title: "Is AI a threat to humanity?",
      slug: "ai-threat-humanity",
      description: "Discuss whether artificial intelligence poses existential risks",
      category: Category.TECHNOLOGY,
      heat: 78.2,
      trendingScore: 88.5,
    },
    {
      title: "Should healthcare be free?",
      slug: "free-healthcare",
      description: "Debate universal healthcare systems vs private healthcare",
      category: Category.POLITICS,
      heat: 72.1,
      trendingScore: 75.3,
    },
    {
      title: "Does free will exist?",
      slug: "free-will-existence",
      description: "Philosophical debate on determinism vs free will",
      category: Category.PHILOSOPHY,
      heat: 45.6,
      trendingScore: 50.2,
    },
    {
      title: "Is climate change primarily human-caused?",
      slug: "climate-change-human-caused",
      description: "Debate the science and causes of climate change",
      category: Category.ENVIRONMENT,
      heat: 90.3,
      trendingScore: 95.7,
    },
  ];

  for (const topic of topics) {
    const createdTopic = await prisma.topic.upsert({
      where: { slug: topic.slug },
      update: topic,
      create: topic,
    });

    // Create camps for each topic
    await prisma.camp.upsert({
      where: { topicId_position: { topicId: createdTopic.id, position: "Pro" } },
      update: {},
      create: {
        topicId: createdTopic.id,
        position: "Pro",
        description: `Supporting the pro position on ${createdTopic.title}`,
      },
    });

    await prisma.camp.upsert({
      where: { topicId_position: { topicId: createdTopic.id, position: "Con" } },
      update: {},
      create: {
        topicId: createdTopic.id,
        position: "Con",
        description: `Supporting the con position on ${createdTopic.title}`,
      },
    });
  }

  console.log("✅ Created topics and camps");

  // Create Demo Users
  const password = await bcrypt.hash("demo123", 10);

  const demoUsers = [
    {
      username: "alex_debater",
      email: "alex@arena.dev",
      password,
      eloRating: 1450,
      credibilityScore: 72.5,
      level: 5,
      xp: 850,
      totalDebates: 23,
      wins: 14,
      losses: 7,
      draws: 2,
    },
    {
      username: "sam_philosopher",
      email: "sam@arena.dev",
      password,
      eloRating: 1320,
      credibilityScore: 65.8,
      level: 3,
      xp: 420,
      totalDebates: 15,
      wins: 8,
      losses: 6,
      draws: 1,
    },
    {
      username: "taylor_facts",
      email: "taylor@arena.dev",
      password,
      eloRating: 1580,
      credibilityScore: 88.2,
      level: 7,
      xp: 1250,
      totalDebates: 35,
      wins: 22,
      losses: 10,
      draws: 3,
      mindChanges: 2,
    },
  ];

  for (const userData of demoUsers) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: userData,
      create: userData,
    });
  }

  console.log("✅ Created demo users");

  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
