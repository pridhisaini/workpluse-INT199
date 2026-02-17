import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const user = (req as any).user;

        if (user && user.organizationId) {
            // Attach organizationId to the request for easy access in controllers/services
            (req as any).tenantId = user.organizationId;
        }

        next();
    }
}
