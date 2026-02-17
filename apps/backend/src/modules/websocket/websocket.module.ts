import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WebsocketGateway } from './websocket.gateway';
import { PresenceService } from './presence.service';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
    imports: [
        forwardRef(() => SessionsModule),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get('jwt.secret'),
                signOptions: { expiresIn: config.get('jwt.expiresIn') },
            }),
        }),
    ],
    providers: [WebsocketGateway, PresenceService],
    exports: [WebsocketGateway, PresenceService],
})
export class WebsocketModule { }
