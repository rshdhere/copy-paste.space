import { Request, Response, NextFunction } from 'express';

export function verifyFrontendAccess(req: Request, res: Response, next: NextFunction) {
    const secretKey = process.env.FRONTEND_SECRET_KEY; //from env
    const clientKey = req.headers['Access-Key'];

    if (clientKey !== secretKey) {
        return res.status(403).json({ error: 'Forbidden: Invalid Access Key' });
    }
    next();
}