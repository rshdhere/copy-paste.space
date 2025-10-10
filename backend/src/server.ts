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

// CORS allow requests only from Frontend URL
const allowedOrigin = [process.env.FRONTEND_ORIGIN_PROD!,process.env.FRONTEND_ORIGIN_DEV!];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(new Error("Not allowed by CORS: Missing Origin"));
    }

    if (allowedOrigin.includes(origin)) {
      return callback(null, true); // allowed
    }
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposedHeaders: ["Content-Length", "Content-Type"],
}));
app.get("/", (req, res) => {
  res.json({ message: "Hello from backend!" });
});


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
        // Start the warmup cron job
        startWarmupCron();
        // Start S3 cleanup cron job
        startS3CleanupCron();
    })
};

StartServer();