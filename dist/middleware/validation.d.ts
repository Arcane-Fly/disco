import { Request, Response, NextFunction } from 'express';
/**
 * Middleware to handle validation result
 */
export declare const handleValidationErrors: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * Validation rules for file operations
 */
export declare const validateFileOperation: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined))[];
/**
 * Validation rules for git operations
 */
export declare const validateGitOperation: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined))[];
/**
 * Validation rules for terminal operations
 */
export declare const validateTerminalOperation: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined))[];
/**
 * Validation rules for computer-use operations
 */
export declare const validateComputerUseOperation: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined))[];
/**
 * Validation rules for RAG search
 */
export declare const validateRAGSearch: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined))[];
/**
 * Validation rules for container operations
 */
export declare const validateContainerOperation: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined))[];
/**
 * Sanitize file path to prevent directory traversal
 */
export declare const sanitizeFilePath: (filePath: string) => string;
/**
 * Validate command for security (used in terminal operations)
 */
export declare const validateCommandSecurity: (command: string) => {
    isValid: boolean;
    reason?: string;
};
//# sourceMappingURL=validation.d.ts.map