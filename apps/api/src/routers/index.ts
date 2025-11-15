import { router } from "../trpc";
import { authRouter } from "./auth";
import { userRouter } from "./user";
import { topicRouter } from "./topic";
import { debateRouter } from "./debate";
import { voteRouter } from "./vote";
import { campRouter } from "./camp";
import { achievementRouter } from "./achievement";
import { leaderboardRouter } from "./leaderboard";
import { notificationRouter } from "./notification";

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  topic: topicRouter,
  debate: debateRouter,
  vote: voteRouter,
  camp: campRouter,
  achievement: achievementRouter,
  leaderboard: leaderboardRouter,
  notification: notificationRouter,
});

export type AppRouter = typeof appRouter;
