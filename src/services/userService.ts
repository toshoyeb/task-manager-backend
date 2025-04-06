import User, { IUser } from "../models/User";
import jwt from "jsonwebtoken";

export const createUser = async (userData: {
  name: string;
  email: string;
  password: string;
}): Promise<IUser> => {
  const { name, email, password } = userData;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error("User already exists");
  }

  // Create user
  const user = await User.create({ name, email, password });
  return user;
};

export const findUserByEmail = async (email: string): Promise<IUser | null> => {
  return User.findOne({ email });
};

export const findUserById = async (id: string): Promise<IUser | null> => {
  return User.findById(id).select("-password");
};

export const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET ?? "default_secret", {
    expiresIn: "30d",
  });
};
