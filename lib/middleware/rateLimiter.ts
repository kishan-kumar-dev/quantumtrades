import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 30, // max requests per minute
  message: "Too many requests, try again later.",
});
