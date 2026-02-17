import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { bufferLogs: true });

    app.useGlobalInterceptors(new TransformInterceptor());
    app.setGlobalPrefix('api');

    // Use Pino Logger
    const logger = app.get(Logger);
    app.useLogger(logger);

    // Redis Adapter for Socket.IO
    const configService = app.get(ConfigService);
    const pubClient = new Redis({
        host: configService.get('redis.host'),
        port: configService.get('redis.port'),
    });
    const subClient = pubClient.duplicate();
    app.useWebSocketAdapter(new (class extends IoAdapter {
        createIOServer(port: number, options?: any): any {
            const server = super.createIOServer(port, options);
            server.adapter(createAdapter(pubClient, subClient));
            return server;
        }
    })(app));

    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));

    // CORS
    app.enableCors();

    // Graceful Shutdown
    app.enableShutdownHooks();

    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`🚀 WorkPulse Backend running on port ${port}`);
}
bootstrap();
