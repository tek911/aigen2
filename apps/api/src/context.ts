import { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { prisma } from "@arena/database";
import * as jwt from "jsonwebtoken";

export interface User {
  id: string;
  username: string;
  email: string;
}

export async function createContext({ req, res }: CreateExpressContextOptions) {
  // Get user from JWT token if present
  let user: User | null = null;

  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || "secret") as User;
      user = decoded;
    } catch (error) {
      // Invalid token, user remains null
    }
  }

  return {
    req,
    res,
    prisma,
    user,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
