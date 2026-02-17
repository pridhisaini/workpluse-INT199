import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { WorkSession } from '../../sessions/entities/work-session.entity';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity('activity_logs')
@Index(['sessionId', 'timestamp'])
export class ActivityLog {
    @PrimaryColumn('uuid')
    id: string;

    @Column()
    organizationId: string;

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organizationId' })
    organization: Organization;

    @Column()
    userId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ nullable: true })
    sessionId: string;

    @ManyToOne(() => WorkSession, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'sessionId' })
    session: WorkSession;

    @Column()
    action: string;

    @Column({ type: 'text', nullable: true })
    details: string;

    @Column()
    type: string;

    @PrimaryColumn({ type: 'timestamp' })
    timestamp: Date;
}
