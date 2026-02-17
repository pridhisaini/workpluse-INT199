import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { WorkSession } from './entities/work-session.entity';
import { ActivityLog } from '../activity/entities/activity-log.entity';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([WorkSession, ActivityLog]),
        forwardRef(() => WebsocketModule),
    ],
    controllers: [SessionsController],
    providers: [SessionsService],
    exports: [SessionsService],
})
export class SessionsModule { }
