import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index, VersionColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Project } from '../../projects/entities/project.entity';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity('work_sessions')
@Index(['userId', 'date'])
@Index(['organizationId', 'status'])
export class WorkSession {
    @PrimaryGeneratedColumn('uuid')
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
    projectId: string;

    @ManyToOne(() => Project, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'projectId' })
    project: Project;

    @Column({ nullable: true })
    task: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'timestamp' })
    startTime: Date;

    @Column({ type: 'timestamp', nullable: true })
    endTime: Date;

    @Column({ type: 'int', default: 0 })
    duration: number; // Total duration in integer seconds

    @Column({ type: 'int', default: 0 })
    activeSeconds: number;

    @Column({ type: 'int', default: 0 })
    idleSeconds: number;

    @Column({ type: 'timestamp', nullable: true })
    lastActivityTimestamp: Date;

    @Column({ default: 'running' })
    status: string;

    @Column({ type: 'date' })
    date: Date;

    @Column({ default: false })
    isManual: boolean;

    @VersionColumn()
    version: number; // Optimistic locking

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
