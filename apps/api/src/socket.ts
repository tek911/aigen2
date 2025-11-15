import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";
import { SOCKET_EVENTS } from "@arena/shared";
import * as jwt from "jsonwebtoken";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

let io: Server;

export function initializeSocketIO(httpServer: HTTPServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.NEXTAUTH_SECRET || "secret"
      ) as {
        id: string;
        username: string;
      };

      socket.userId = decoded.id;
      socket.username = decoded.username;
      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.username} (${socket.userId})`);

    // Join debate room
    socket.on(SOCKET_EVENTS.DEBATE_JOIN, (debateId: string) => {
      socket.join(`debate:${debateId}`);
      console.log(`${socket.username} joined debate ${debateId}`);

      // Notify others
      socket.to(`debate:${debateId}`).emit(SOCKET_EVENTS.PRESENCE_UPDATE, {
        userId: socket.userId,
        username: socket.username,
        status: "online",
      });

      // Send current spectator count
      const room = io.sockets.adapter.rooms.get(`debate:${debateId}`);
      io.to(`debate:${debateId}`).emit(
        SOCKET_EVENTS.SPECTATOR_COUNT,
        room?.size || 0
      );
    });

    // Leave debate room
    socket.on(SOCKET_EVENTS.DEBATE_LEAVE, (debateId: string) => {
      socket.leave(`debate:${debateId}`);
      console.log(`${socket.username} left debate ${debateId}`);

      // Notify others
      socket.to(`debate:${debateId}`).emit(SOCKET_EVENTS.PRESENCE_UPDATE, {
        userId: socket.userId,
        username: socket.username,
        status: "offline",
      });

      // Send updated spectator count
      const room = io.sockets.adapter.rooms.get(`debate:${debateId}`);
      io.to(`debate:${debateId}`).emit(
        SOCKET_EVENTS.SPECTATOR_COUNT,
        room?.size || 0
      );
    });

    // Argument submission
    socket.on(SOCKET_EVENTS.ARGUMENT_SUBMIT, (data: { debateId: string; argument: any }) => {
      // Broadcast new argument to all in the debate
      io.to(`debate:${data.debateId}`).emit(SOCKET_EVENTS.ARGUMENT_RECEIVED, {
        argument: data.argument,
        timestamp: new Date(),
      });
    });

    // Typing indicators
    socket.on(SOCKET_EVENTS.TYPING_START, (debateId: string) => {
      socket.to(`debate:${debateId}`).emit(SOCKET_EVENTS.TYPING_START, {
        userId: socket.userId,
        username: socket.username,
      });
    });

    socket.on(SOCKET_EVENTS.TYPING_STOP, (debateId: string) => {
      socket.to(`debate:${debateId}`).emit(SOCKET_EVENTS.TYPING_STOP, {
        userId: socket.userId,
        username: socket.username,
      });
    });

    // Reactions
    socket.on(
      SOCKET_EVENTS.REACTION_ADD,
      (data: { debateId: string; argumentId: string; reactionType: string }) => {
        io.to(`debate:${data.debateId}`).emit(SOCKET_EVENTS.REACTION_UPDATE, {
          argumentId: data.argumentId,
          reactionType: data.reactionType,
          userId: socket.userId,
        });
      }
    );

    // Debate start/end
    socket.on(SOCKET_EVENTS.DEBATE_START, (debateId: string) => {
      io.to(`debate:${debateId}`).emit(SOCKET_EVENTS.DEBATE_START, {
        debateId,
        timestamp: new Date(),
      });
    });

    socket.on(SOCKET_EVENTS.DEBATE_END, (debateId: string) => {
      io.to(`debate:${debateId}`).emit(SOCKET_EVENTS.DEBATE_END, {
        debateId,
        timestamp: new Date(),
      });
    });

    // Debate updates (turn changes, timer, etc.)
    socket.on(SOCKET_EVENTS.DEBATE_UPDATE, (data: { debateId: string; update: any }) => {
      io.to(`debate:${data.debateId}`).emit(SOCKET_EVENTS.DEBATE_UPDATE, data.update);
    });

    // Notifications
    socket.on(SOCKET_EVENTS.NOTIFICATION_READ, (notificationId: string) => {
      // Could sync read status across devices
      socket.emit(SOCKET_EVENTS.NOTIFICATION_READ, { notificationId });
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.username}`);
    });
  });

  console.log("✅ Socket.IO initialized");
}

export function getSocketIO(): Server {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
}

// Helper functions for emitting events from API
export function emitToDebate(debateId: string, event: string, data: any) {
  if (io) {
    io.to(`debate:${debateId}`).emit(event, data);
  }
}

export function emitToUser(userId: string, event: string, data: any) {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

export function emitNotification(userId: string, notification: any) {
  if (io) {
    io.to(`user:${userId}`).emit(SOCKET_EVENTS.NOTIFICATION_NEW, notification);
  }
}
