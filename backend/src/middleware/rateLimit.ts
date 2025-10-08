import rateLimit from 'express-rate-limit';
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";

// Rate limiter for send endpoint (more restrictive)
export const sendRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
        // Calculate time until the next request can be made
        // This is the time until the oldest request in the window expires
        const retryAfter = Math.ceil(15 * 60 / 10); // 90 seconds - time until next slot opens
        res.set('Retry-After', retryAfter.toString());
        res.status(429).json({
            error: "Too many requests",
            message: `Rate limit hit. Try again in ${retryAfter} seconds.`,
            retryAfter: retryAfter
        });
    }
});

// Rate limiter for receive endpoint (less restrictive)
export const receiveRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // limit each IP to 30 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        // Calculate time until the next request can be made
        const retryAfter = Math.ceil(15 * 60 / 30); // 30 seconds - time until next slot opens
        res.set('Retry-After', retryAfter.toString());
        res.status(429).json({
            error: "Too many requests",
            message: `Rate limit hit. Try again in ${retryAfter} seconds.`,
            retryAfter: retryAfter
        });
    }
});

// General rate limiter for all other endpoints
export const generalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        // Calculate time until the next request can be made
        const retryAfter = Math.ceil(15 * 60 / 100); // 9 seconds - time until next slot opens
        res.set('Retry-After', retryAfter.toString());
        res.status(429).json({
            error: "Too many requests",
            message: `Rate limit hit. Try again in ${retryAfter} seconds.`,
            retryAfter: retryAfter
        });
    }
}); 

// CORS allow requests only from Frontend URL
const allowedOrigin = [process.env.FRONTEND_ORIGIN_PROD!,process.env.FRONTEND_ORIGIN_DEV!];
const app = express();
app.use(cors({
    origin: (origin, callback) => {
    if (!origin){
        return callback(new Error("Not allowed by CORS"));
    }
    if (allowedOrigin.includes(origin)){
        return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposedHeaders: ["Content-Length", "Content-Type"],
}));

