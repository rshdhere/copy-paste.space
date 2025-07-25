import express from "express";
import cors from "cors";
import { ConnectedToDB } from "./database/database";
import senderRouter from "./routes/sender";
import receiverRouter from "./routes/receiver";
const app = express();

// for parsing user data
app.use(express.json());
app.use(cors());

// routes
app.use("/api/v1/user", senderRouter);
app.use("/api/v1/user", receiverRouter);


const PORT = process.env.PORT || 8080;

async function StartServer(){
    await ConnectedToDB();
    app.listen(PORT, () => {
        console.log(`your server is listening on http://localhost:${PORT}`)
    })
};

StartServer();