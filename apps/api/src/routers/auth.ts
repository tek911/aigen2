import { router, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { registerSchema, loginSchema } from "@arena/shared";

export const authRouter = router({
  register: publicProcedure.input(registerSchema).mutation(async ({ ctx, input }) => {
    // Check if user already exists
    const existing = await ctx.prisma.user.findFirst({
      where: {
        OR: [{ email: input.email }, { username: input.username }],
      },
    });

    if (existing) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "User with this email or username already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(input.password, 10);

    // Create user
    const user = await ctx.prisma.user.create({
      data: {
        username: input.username,
        email: input.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        eloRating: true,
        level: true,
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.NEXTAUTH_SECRET || "secret",
      { expiresIn: "7d" }
    );

    return {
      user,
      token,
    };
  }),

  login: publicProcedure.input(loginSchema).mutation(async ({ ctx, input }) => {
    // Find user
    const user = await ctx.prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user || !user.password) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }

    // Verify password
    const valid = await bcrypt.compare(input.password, user.password);
    if (!valid) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.NEXTAUTH_SECRET || "secret",
      { expiresIn: "7d" }
    );

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        eloRating: user.eloRating,
        level: user.level,
      },
      token,
    };
  }),
});
