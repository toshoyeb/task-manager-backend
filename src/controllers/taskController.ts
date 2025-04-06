import { Request, Response } from "express";
import Task from "../models/Task";
import mongoose from "mongoose";

// Create a new task
export const createTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log(
      `[${new Date().toISOString()}] Creating task: ${JSON.stringify(req.body)}`
    );

    if (!req.user?._id) {
      console.log(
        `[${new Date().toISOString()}] Authorization failed: No user ID found`
      );
      res.status(401).json({ error: "Not authorized" });
      return;
    }

    const userId = req.user._id.toString();
    console.log(
      `[${new Date().toISOString()}] Creating task for user: ${userId}`
    );

    const { title, description, category, tags, priority, dueDate } = req.body;

    const task = await Task.create({
      title,
      description,
      category,
      tags: tags || [],
      priority,
      dueDate,
      user: userId,
    });

    console.log(
      `[${new Date().toISOString()}] Task created successfully: ${task._id}`
    );
    res.status(201).json(task);
  } catch (error: any) {
    console.error(
      `[${new Date().toISOString()}] Error creating task: ${error.message}`
    );
    res.status(500).json({ error: error.message });
  }
};

// Get all tasks for the authenticated user
export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ error: "Not authorized" });
      return;
    }

    const { status, category, search } = req.query;

    // Build filter based on query parameters
    let filter: any = { user: req.user._id };

    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get task by ID
export const getTaskById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ error: "Not authorized" });
      return;
    }

    const userId = req.user._id.toString();
    const task = await Task.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    res.json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update task
export const updateTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ error: "Not authorized" });
      return;
    }

    const userId = req.user._id.toString();
    const task = await Task.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    const { title, description, status, category, tags, priority, dueDate } =
      req.body;

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (category) task.category = category;
    if (tags) task.tags = tags;
    if (priority) task.priority = priority;
    if (dueDate) task.dueDate = dueDate;

    await task.save();

    res.json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Delete task
export const deleteTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ error: "Not authorized" });
      return;
    }

    const userId = req.user._id.toString();
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: userId,
    });

    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    res.json({ message: "Task removed" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get task statistics
export const getTaskStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ error: "Not authorized" });
      return;
    }

    const userId = req.user._id.toString();
    const totalTasks = await Task.countDocuments({ user: req.user._id });
    const completedTasks = await Task.countDocuments({
      user: req.user._id,
      status: "completed",
    });
    const pendingTasks = await Task.countDocuments({
      user: req.user._id,
      status: "pending",
    });

    // Get tasks by category
    const tasksByCategory = await Task.aggregate([
      {
        $match: { user: new mongoose.Types.ObjectId(userId) },
      },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Get tasks by priority
    const tasksByPriority = await Task.aggregate([
      {
        $match: { user: new mongoose.Types.ObjectId(userId) },
      },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);

    res.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate: totalTasks ? (completedTasks / totalTasks) * 100 : 0,
      tasksByCategory,
      tasksByPriority,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
