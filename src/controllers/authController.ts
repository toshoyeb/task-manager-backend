import { Request, Response } from "express";
import {
  createUser,
  findUserByEmail,
  findUserById,
  generateToken,
} from "../services/userService";

// Register a new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const user = await createUser({ name, email, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id.toString()),
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await findUserByEmail(email);

    // Check if user exists and password matches
    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get user profile
export const getProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ error: "Not authorized" });
      return;
    }

    const userId = req.user._id.toString();
    const user = await findUserById(userId);

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
