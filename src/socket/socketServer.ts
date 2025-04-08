import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import User from "../models/User";
import { MessageHandler } from "./messageHandler";

interface UserSocket extends Socket {
  userId?: string;
}

export class SocketServer {
  private readonly io: Server; // ✅ marked readonly
  private readonly connectedUsers: Map<string, string> = new Map(); // ✅ marked readonly
  private readonly messageHandler: MessageHandler; // ✅ marked readonly and used

  constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL ?? "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.messageHandler = new MessageHandler(this.io); // ✅ move this before setup
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on("connection", (socket: UserSocket) => {
      console.log(`User connected: ${socket.id}`);

      socket.on("authenticate", async (userId: string) => {
        try {
          const user = await User.findById(userId);
          if (!user) {
            socket.emit("error", "User not found");
            return;
          }

          socket.userId = userId;
          this.connectedUsers.set(userId, socket.id);
          console.log(`User authenticated: ${userId}`);

          socket.join(userId); // Join room with userId

          socket.broadcast.emit("userOnline", userId);
        } catch (error) {
          console.error("Authentication error:", error);
          socket.emit("error", "Authentication failed");
        }
      });

      socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
          socket.broadcast.emit("userOffline", socket.userId);
        }
      });

      socket.on("error", (error) => {
        console.error("Socket error:", error);
      });
    });
  }

  public getIO(): Server {
    return this.io;
  }

  public getSocketId(userId: string): string | undefined {
    return this.connectedUsers.get(userId);
  }

  public isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}
