import { Request, Response, NextFunction } from 'express';
export declare const errorHandler: (error: Error & {
    name?: string;
    code?: string;
    type?: string;
}, req: Request, res: Response, _next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map