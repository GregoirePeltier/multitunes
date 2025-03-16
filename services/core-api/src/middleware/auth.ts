// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

/**
 * Generates a JWT token with a specified expiration time.
 *
 * @param payload - The data to include in the JWT payload.
 * @param duration - The time duration for which the token will be valid (e.g., '1h', '30m', '7d').
 * @returns The generated JWT token as a string.
 */
export const generateToken = (payload: object, duration: any): string => {
    const secretOrPrivateKey = process.env.JWT_SECRET;
    if (!secretOrPrivateKey) {
        throw new Error("JWT_SECRET not set");
    }
    return jwt.sign(payload, secretOrPrivateKey, {expiresIn: duration});
};
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ error: 'Access token required' });
        return;
    }
    let secretOrPublicKey = process.env.JWT_SECRET;
    if(!secretOrPublicKey){
        console.error("JWT_SECRET not set");
        res.status(500).json({ error: 'Internal server error' });
        return;
    }
    try {

        const user = jwt.verify(token, secretOrPublicKey);
        req.user = user;
        next();
    } catch (error) {
        res.status(403).json({ error: 'Invalid token' });
        return;
    }
};
