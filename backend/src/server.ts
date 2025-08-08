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

// Apply general rate limiting to all routes
app.use(generalRateLimiter);

// routes
app.use("/api/v1/user", senderRouter);
app.use("/api/v1/user", receiverRouter);

const PORT = parseInt(process.env.PORT || '8080', 10);

// Allow only frontend URL
const allowedOrigin = "https://copy-paste.space/send";
const CorsOptions: cors.CorsOptions = {
    origin: function(origin , callback){
        if(origin==allowedOrigin){
            callback(null , true);
        }
        else{
            callback(new Error('CORS Error: This origin is not allowed to access the server.'))
        }
    },
    credentials:true,
    optionsSuccessStatus: 200
};
app.use(cors(CorsOptions));

async function StartServer(){
    await ConnectedToDB();
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`your server is listening on http://localhost:${PORT}`)
        // Start the warmup cron job
        startWarmupCron();
    })
};

StartServer();