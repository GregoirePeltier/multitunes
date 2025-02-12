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
