import { Request, Response, NextFunction } from 'express';

const BLOCKED_IPS = [
    '185.177.72.106'
];

export const ipBlockMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip;
    
    // Check if the client IP is in the blocked list
    if (clientIP && BLOCKED_IPS.includes(clientIP)) {
        console.log(`[BLOCKED] IP ${clientIP} attempted to access ${req.method} ${req.path}`);
        return res.status(403).json({
            error: "Access Forbidden",
            message: "Your IP address has been permanently blocked due to security violations."
        });
    }
    
    next();
}; 