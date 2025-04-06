import mongoose, { Document, Schema } from "mongoose";

export enum Priority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export enum TaskStatus {
  PENDING = "pending",
  IN_PROGRESS = "in-progress",
  COMPLETED = "completed",
}

export enum TaskCategory {
  WORK = "work",
  PERSONAL = "personal",
  SHOPPING = "shopping",
  HEALTH = "health",
  EDUCATION = "education",
  FINANCE = "finance",
  OTHER = "other",
}

export interface ITask extends Document {
  title: string;
  description: string;
  status: TaskStatus;
  category: TaskCategory;
  tags: string[];
  priority: Priority;
  dueDate: Date;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.PENDING,
    },
    category: {
      type: String,
      enum: Object.values(TaskCategory),
      default: TaskCategory.OTHER,
      required: false,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    priority: {
      type: String,
      enum: Object.values(Priority),
      default: Priority.MEDIUM,
    },
    dueDate: {
      type: Date,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ITask>("Task", TaskSchema);
