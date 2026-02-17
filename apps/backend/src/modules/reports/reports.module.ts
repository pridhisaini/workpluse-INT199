import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { WorkSession } from '../sessions/entities/work-session.entity';
import { User } from '../users/entities/user.entity';

import { Project } from '../projects/entities/project.entity';

@Module({
    imports: [TypeOrmModule.forFeature([WorkSession, User, Project])],
    controllers: [ReportsController],
    providers: [ReportsService],
    exports: [ReportsService],
})
export class ReportsModule { }
