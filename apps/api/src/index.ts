import express from "express";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { createContext } from "./context";
import { appRouter } from "./routers";
import { initializeSocketIO } from "./socket";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// tRPC endpoint
app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Initialize Socket.IO
initializeSocketIO(httpServer);

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 API server running on port ${PORT}`);
  console.log(`📡 tRPC endpoint: http://localhost:${PORT}/trpc`);
  console.log(`🔌 Socket.IO ready for connections`);
});
