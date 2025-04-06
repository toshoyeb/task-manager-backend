import express from "express";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats,
} from "../controllers/taskController";
import auth from "../middleware/auth";

const router = express.Router();

// All routes are protected with auth middleware
router.use(auth);

router.post("/", createTask);
router.get("/", getTasks);
router.get("/stats", getTaskStats);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
