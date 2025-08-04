import express from "express";
import cors from "cors";
import { ConnectedToDB } from "./database/database";
import senderRouter from "./routes/sender";
import receiverRouter from "./routes/receiver";
import { startWarmupCron } from "./warmup-cron";
import { generalRateLimiter } from "./middleware/rateLimit";
import { ipBlockMiddleware } from "./middleware/ipBlock";

const app = express();

// Trust proxy for proper IP handling behind reverse proxy (Vercel + Railway)
// Trust only specific proxy IPs or use 'loopback' for local development
app.set('trust proxy', process.env.NODE_ENV === 'production' ? 1 : 'loopback');

// IP blocking middleware (must come before other middleware)
app.use(ipBlockMiddleware);

// for parsing user data
app.use(express.json());
app.use(cors());

// IP logging middleware for debugging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    console.log(`  Client IP: ${req.ip}`);
    console.log(`  Remote Address: ${req.connection.remoteAddress}`);
    console.log(`  X-Forwarded-For: ${req.headers['x-forwarded-for'] || 'not set'}`);
    console.log(`  X-Real-IP: ${req.headers['x-real-ip'] || 'not set'}`);
    console.log(`  User-Agent: ${req.headers['user-agent']?.substring(0, 50)}...`);
    next();
});

// Apply general rate limiting to all routes
app.use(generalRateLimiter);

// routes
app.use("/api/v1/user", senderRouter);
app.use("/api/v1/user", receiverRouter);

// Test endpoint to verify rate limiting
app.get("/test-rate-limit", (req, res) => {
    res.json({
        message: "Rate limit test endpoint",
        clientIP: req.ip,
        headers: {
            'x-forwarded-for': req.headers['x-forwarded-for'],
            'x-real-ip': req.headers['x-real-ip']
        }
    });
});


const PORT = parseInt(process.env.PORT || '8080', 10);

async function StartServer(){
    await ConnectedToDB();
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`your server is listening on http://localhost:${PORT}`)
        // Start the warmup cron job
        startWarmupCron();
    })
};

StartServer();