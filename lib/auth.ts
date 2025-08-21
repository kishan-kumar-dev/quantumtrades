import pkg from "jsonwebtoken";
import bcrypt from "bcryptjs";

const { sign, verify } = pkg; // destructure CommonJS default export

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"; // Make sure to set in .env

// Sign JWT
export const signJWT = (
  payload: Record<string, any>,
  expiresIn: string = "1h"
): string => {
  return sign(payload, JWT_SECRET, { expiresIn });
};

// Verify JWT
export const verifyJWT = async (token: string) => {
  try {
    const decoded = verify(token, JWT_SECRET);
    return decoded as Record<string, any>;
  } catch (err) {
    return null;
  }
};

// Hash password
export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Compare password
export const comparePassword = async (
  password: string,
  hashedPassword: string
) => {
  return bcrypt.compare(password, hashedPassword);
};
