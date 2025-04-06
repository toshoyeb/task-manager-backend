import Task, { ITask, TaskCategory } from "../models/Task";
import mongoose from "mongoose";

interface TaskFilter {
  user: mongoose.Types.ObjectId;
  status?: string;
  category?: string;
  title?: { $regex: string; $options: string };
}

export const createTask = async (
  taskData: Partial<ITask>,
  userId: string
): Promise<ITask> => {
  // Due date validation
  if (taskData.dueDate && new Date(taskData.dueDate) < new Date()) {
    throw new Error("Due date cannot be set in the past");
  }

  // Set default values if not provided
  const taskWithDefaults = {
    category: TaskCategory.OTHER,
    tags: [],
    ...taskData,
    user: userId,
  };

  console.log(
    `[${new Date().toISOString()}] Creating task with defaults: ${JSON.stringify(
      taskWithDefaults
    )}`
  );

  const task = await Task.create(taskWithDefaults);
  return task;
};

export const findTasks = async (filter: TaskFilter): Promise<ITask[]> => {
  return Task.find(filter).sort({ createdAt: -1 });
};

export const findTaskById = async (
  taskId: string,
  userId: string
): Promise<ITask | null> => {
  return Task.findOne({ _id: taskId, user: userId });
};

export const updateTaskById = async (
  taskId: string,
  userId: string,
  updates: Partial<ITask>
): Promise<ITask | null> => {
  // Due date validation
  if (updates.dueDate && new Date(updates.dueDate) < new Date()) {
    throw new Error("Due date cannot be set in the past");
  }

  const task = await Task.findOne({ _id: taskId, user: userId });

  if (!task) return null;

  Object.assign(task, updates);

  await task.save();
  return task;
};

export const deleteTaskById = async (
  taskId: string,
  userId: string
): Promise<ITask | null> => {
  return Task.findOneAndDelete({ _id: taskId, user: userId });
};

export const getTaskStatistics = async (userId: string) => {
  const totalTasks = await Task.countDocuments({ user: userId });
  const completedTasks = await Task.countDocuments({
    user: userId,
    status: "completed",
  });
  const pendingTasks = await Task.countDocuments({
    user: userId,
    status: "pending",
  });

  // Get tasks by category
  const tasksByCategory = await Task.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // Get tasks by priority
  const tasksByPriority = await Task.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: "$priority", count: { $sum: 1 } } },
  ]);

  return {
    totalTasks,
    completedTasks,
    pendingTasks,
    completionRate: totalTasks ? (completedTasks / totalTasks) * 100 : 0,
    tasksByCategory,
    tasksByPriority,
  };
};
