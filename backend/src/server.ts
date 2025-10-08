import express from "express";
import cors from "cors";
import { ConnectedToDB } from "./database/database";
import senderRouter from "./routes/sender";
import receiverRouter from "./routes/receiver";
import { startWarmupCron } from "./warmup-cron";
import { generalRateLimiter } from "./middleware/rateLimit";
import { ipBlockMiddleware } from "./middleware/ipBlock";
import imagesRouter from "./routes/images";
import { startS3CleanupCron } from "./s3-cleanup-cron";

const app = express();

// Trust proxy for proper IP handling behind reverse proxy (Vercel + Railway)
// Trust only specific proxy IPs or use 'loopback' for local development
app.set('trust proxy', process.env.NODE_ENV === 'production' ? 1 : 'loopback');

// IP blocking middleware (must come before other middleware)
app.use(ipBlockMiddleware);

// for parsing user data
app.use(express.json());

// CORS setup to allow access from any origin (including Postman and other tools)
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*";
app.use(cors({
  origin: "*", // Allow any origin to access the API
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposedHeaders: ["Content-Length", "Content-Type"],
}));

// Apply general rate limiting to all routes
app.use(generalRateLimiter);

// routes
app.use("/api/v1/user", senderRouter);
app.use("/api/v1/user", receiverRouter);
app.use("/api/v1/images", imagesRouter);

const PORT = parseInt(process.env.PORT || '8080', 10);

async function StartServer(){
    await ConnectedToDB();
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`your server is listening on http://localhost:${PORT}`)
        // start the warmup cron job, dont need it anymore -- planning to move on digital-ocean
        // startWarmupCron();
        // Start S3 cleanup cron job
        startS3CleanupCron();
    })
};

StartServer();
