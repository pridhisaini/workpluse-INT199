import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { BullModule } from '@nestjs/bullmq';
import configuration from './config/configuration';
import { validate } from './config/env.validation';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { ActivityModule } from './modules/activity/activity.module';
import { ReportsModule } from './modules/reports/reports.module';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { HealthModule } from './modules/health/health.module';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { RedisModule } from './modules/redis/redis.module';

@Module({
    imports: [
        RedisModule,
        ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration],
            validate,
        }),
        LoggerModule.forRoot({
            pinoHttp: {
                level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
                // transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
            },
        }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                ...(config.get<any>('database')),
                type: 'postgres',
                autoLoadEntities: true,
                synchronize: false,
                logging: process.env.NODE_ENV !== 'production',
            }),
        }),
        BullModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                connection: config.get<any>('redis'),
            }),
        }),
        AuthModule,
        UsersModule,
        OrganizationsModule,
        ProjectsModule,
        SessionsModule,
        ActivityModule,
        ReportsModule,
        WebsocketModule,
        JobsModule,
        HealthModule,
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(TenantMiddleware)
            .exclude('auth/(.*)')
            .forRoutes('*');
    }
}
