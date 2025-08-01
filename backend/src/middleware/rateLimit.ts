import rateLimit from 'express-rate-limit';

// Rate limiter for send endpoint (more restrictive)
export const sendRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
        const retryAfter = Math.ceil(15 * 60 / 10); // Calculate retry after time in seconds
        res.set('Retry-After', retryAfter.toString());
        res.status(429).json({
            error: "Too many requests",
            message: "Please wait a few minutes before trying again",
            retryAfter: retryAfter
        });
    }
});

// Rate limiter for receive endpoint (less restrictive)
export const receiveRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // limit each IP to 30 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        const retryAfter = Math.ceil(15 * 60 / 30); // Calculate retry after time in seconds
        res.set('Retry-After', retryAfter.toString());
        res.status(429).json({
            error: "Too many requests",
            message: "Please wait a few minutes before trying again",
            retryAfter: retryAfter
        });
    }
});

// General rate limiter for all other endpoints
export const generalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        const retryAfter = Math.ceil(15 * 60 / 100); // Calculate retry after time in seconds
        res.set('Retry-After', retryAfter.toString());
        res.status(429).json({
            error: "Too many requests",
            message: "Please wait a few minutes before trying again",
            retryAfter: retryAfter
        });
    }
}); 