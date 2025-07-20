import express from "express";
import { ConnectedToDB } from "./database/database";
const app = express();

// for parsing user data
app.use(express.json());

// route


const PORT = process.env.PORT || 8080;

async function StartServer(){
    await ConnectedToDB();
    app.listen(PORT, () => {
        console.log(`your server is listening on http://localhost:${PORT}`)
    })
};

StartServer();