import express from "express";
import cors from "cors";
import { ConnectedToDB } from "./database/database";
import senderRouter from "./routes/sender";
import receiverRouter from "./routes/receiver";
import { generalRateLimiter } from "./middleware/rateLimit";
import { ipBlockMiddleware } from "./middleware/ipBlock";
import imagesRouter from "./routes/images";
import { startS3CleanupCron } from "./s3-cleanup-cron";

const app = express();

// Trust only specific proxy IPs or use 'loopback' for local development
app.set('trust proxy', process.env.NODE_ENV === 'production' ? 1 : 'loopback');

// IP blocking middleware (must come before other middleware)
app.use(ipBlockMiddleware);

// for parsing user data
app.use(express.json());

// CORS setup for frontend domain access
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*";
app.use(cors({
  origin: FRONTEND_ORIGIN === "*" ? true : FRONTEND_ORIGIN,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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
        // Start S3 cleanup cron job
        startS3CleanupCron();
    })
};

StartServer();
