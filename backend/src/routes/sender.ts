import { Router } from "express";
import { ContentSchema } from "../types/types";
import { ContentModel } from "../database/database";
import { random } from "../utility/utility";

const senderRouter = Router();

// Health check endpoint for Railway
senderRouter.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", message: "Server is running" });
});

senderRouter.post("/send", async (req, res) => {
    // validation for security
    try {
        const parsedData = ContentSchema.safeParse(req.body);

        if(!parsedData.success){
            res.status(403).json({
                message: "Validation Error || 'content' keyword went missing",
                errors: parsedData.error.format()
            })
            return;
        };

        const code = random(4);

        const { content } = parsedData.data;

        await ContentModel.create({
            content,
            code
        });
        
        res.status(201).json({
            message: "content was stored in database",
            code
        })

    } catch(error: any){

        console.error("error occured while sending data to the receive's end at,", error);

        res.status(500).json({
            message: "error occured while sending data to the receive's end"
        })
    }
});

export default senderRouter;