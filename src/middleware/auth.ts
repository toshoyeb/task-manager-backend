import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      token?: string;
    }
  }
}

const auth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET ?? "default_secret"
    ) as { id: string };

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    res.status(401).json({ error: "Please authenticate" });
  }
};

export default auth;
