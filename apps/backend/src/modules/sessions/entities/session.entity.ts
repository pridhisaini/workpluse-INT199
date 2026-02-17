import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Project } from '../../projects/entities/project.entity';

@Entity('sessions')
export class Session {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    userId!: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user!: User;

    @Column({ nullable: true })
    projectId?: string;

    @ManyToOne(() => Project, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'projectId' })
    project?: Project;

    @Column({ nullable: true })
    task?: string;

    @Column({ nullable: true })
    description?: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    startTime!: Date;

    @Column({ type: 'timestamp', nullable: true })
    endTime?: Date;

    @Column({ default: 0 })
    duration!: number; // in seconds

    @Column({ default: 'running' })
    status!: string;

    @Column({ type: 'date', default: () => 'CURRENT_DATE' })
    date!: Date;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
