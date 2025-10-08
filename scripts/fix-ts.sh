#!/bin/bash

# Fix TypeScript issues by updating function signatures

# Fix auth.ts
sed -i 's/async (req: Request, res: Response) => {/async (req: Request, res: Response): Promise<void> => {/g' src/api/auth.ts

# Fix containers.ts
sed -i 's/async (req: Request, res: Response) => {/async (req: Request, res: Response): Promise<void> => {/g' src/api/containers.ts

# Fix files.ts
sed -i 's/async (req: Request, res: Response) => {/async (req: Request, res: Response): Promise<void> => {/g' src/api/files.ts

# Fix git.ts
sed -i 's/async (req: Request, res: Response) => {/async (req: Request, res: Response): Promise<void> => {/g' src/api/git.ts

# Fix terminal.ts
sed -i 's/async (req: Request, res: Response) => {/async (req: Request, res: Response): Promise<void> => {/g' src/api/terminal.ts

# Fix health.ts
sed -i 's/async (req: Request, res: Response) => {/async (req: Request, res: Response): Promise<void> => {/g' src/api/health.ts

# Fix other signatures
sed -i 's/(req: Request, res: Response) => {/(req: Request, res: Response): void => {/g' src/server.ts

# Fix middleware
sed -i 's/(req: Request, res: Response, next: NextFunction) => {/(req: Request, res: Response, next: NextFunction): void => {/g' src/middleware/auth.ts
sed -i 's/(error: any, req: Request, res: Response, next: NextFunction) => {/(error: any, req: Request, res: Response, _next: NextFunction): void => {/g' src/middleware/errorHandler.ts

echo "TypeScript function signatures updated"