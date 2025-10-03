import { Request, Response, NextFunction } from 'express';
import { JWTPayload } from '../types/index.js';
declare module 'express-serve-static-core' {
    interface Request {
        user?: JWTPayload;
    }
}
export declare const authMiddleware: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=auth.d.ts.map