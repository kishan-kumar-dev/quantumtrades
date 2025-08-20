import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

/**
 * Load JWT secret
 * - Dev fallback: "dev_secret_change_me"
 * - Production: must be set in environment
 */
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ??
    (process.env.NODE_ENV === "production"
      ? (() => {
          throw new Error("❌ JWT_SECRET must be set in production");
        })()
      : "dev_secret_change_me")
);

/**
 * JWT payload structure
 */
export type JWTPayload = {
  sub: string;
  email: string;
  role: "trader" | "admin";
  iat?: number;
  exp?: number;
};

/**
 * Hash a plain-text password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a plain-text password with a hash
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Create a signed JWT (valid for 7 days)
 */
export async function createJWT(payload: JWTPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // token valid for 7 days
    .sign(secret);
}

/**
 * Verify a JWT and return its payload
 */
export async function verifyJWT(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, secret);
  return payload as JWTPayload;
}

/**
 * Create an HTTP-only cookie string for the JWT
 */
export function createAuthCookie(token: string): string {
  const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
  return `token=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Strict; Secure=${
    process.env.NODE_ENV === "production"
  }`;
}
