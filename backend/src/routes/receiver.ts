import { Request, Response, Router } from "express";
import { OTPSchema } from "../types/types";
import { ContentModel } from "../database/database";
import { receiveRateLimiter } from "../middleware/rateLimit";
import { verifyFrontendAccess } from "../middleware/verifyFrontendAccess";

const receiverRouter = Router();
// Send protected data to frontend
// Protected (requires valid Access-key header)
receiverRouter.get('/receive', verifyFrontendAccess, (req, res) => {
    res.json({ message: 'This is protected data' });
});


receiverRouter.get("/receive", receiveRateLimiter, async (req: Request, res: Response) => {
    // validation for security
    try {

        const parsedData = OTPSchema.safeParse({ userCode: req.query.userCode});

        if(!parsedData.success){
            res.status(403).json({
                message: "Validation Error || 'userCode' keyword went missing",
                errors: parsedData.error.format()
            })
            return;
        }

        const { userCode } = parsedData.data;

        const data = await ContentModel.find({
            code: userCode
        });

        if(data && data.length > 0){
            res.status(200).json({
                message: "here's your data",
                data
            })
        } else {
            res.status(404).json({
                message: "your code doesnt match with any content, or session expired"
            })
        }
    } catch(error: any){
        console.error("error occured while fetching data from sender's end at,", error);

        res.status(500).json({
            message: "error occured while fetching data from sender's end"
        })
    }
});

export default receiverRouter;