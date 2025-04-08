import { Server, Socket } from "socket.io";
import Message from "../models/message.model";

export class MessageHandler {
  private readonly io: Server;

  constructor(io: Server) {
    this.io = io;
    this.setupMessageHandlers();
  }

  private setupMessageHandlers() {
    this.io.on("connection", (socket: Socket) => {
      // Handle sending messages
      socket.on(
        "sendMessage",
        async (data: {
          receiverId: string;
          content: string;
          type: "text" | "image" | "file" | "voice";
          fileUrl?: string;
        }) => {
          try {
            const { receiverId, content, type, fileUrl } = data;
            const senderId = (socket as any).userId;

            if (!senderId) {
              socket.emit("error", "User not authenticated");
              return;
            }

            // Create new message
            const message = new Message({
              sender: senderId,
              receiver: receiverId,
              content,
              type,
              fileUrl,
            });

            await message.save();

            // Emit message to receiver if online
            const receiverSocketIds = Array.from(
              this.io.sockets.adapter.rooms.get(receiverId) || []
            );
            if (receiverSocketIds.length > 0) {
              this.io.to(receiverSocketIds).emit("newMessage", message);
            }

            // Emit message to sender
            socket.emit("messageSent", message);
          } catch (error) {
            console.error("Error sending message:", error);
            socket.emit("error", "Failed to send message");
          }
        }
      );

      // Handle message read status
      socket.on("markAsRead", async (messageId: string) => {
        try {
          const message = await Message.findById(messageId);
          if (!message) {
            socket.emit("error", "Message not found");
            return;
          }

          message.isRead = true;
          await message.save();

          // Notify sender that message was read
          const senderSocketIds = Array.from(
            this.io.sockets.adapter.rooms.get(message.sender.toString()) || []
          );
          if (senderSocketIds.length > 0) {
            this.io.to(senderSocketIds).emit("messageRead", messageId);
          }
        } catch (error) {
          console.error("Error marking message as read:", error);
          socket.emit("error", "Failed to mark message as read");
        }
      });

      // Handle typing indicator
      socket.on("typing", (data: { receiverId: string; isTyping: boolean }) => {
        const { receiverId, isTyping } = data;
        const receiverSocketIds = Array.from(
          this.io.sockets.adapter.rooms.get(receiverId) || []
        );

        if (receiverSocketIds.length > 0) {
          this.io.to(receiverSocketIds).emit("typing", {
            userId: (socket as any).userId,
            isTyping,
          });
        }
      });
    });
  }
}
