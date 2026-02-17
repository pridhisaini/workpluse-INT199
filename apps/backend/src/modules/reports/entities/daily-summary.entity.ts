import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity('daily_summaries')
@Index(['userId', 'date'], { unique: true })
@Index(['organizationId', 'date'])
export class DailySummary {
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

    @Column({ type: 'date' })
    date: Date;

    @Column({ type: 'int', default: 0 })
    totalWorkSeconds: number;

    @Column({ type: 'int', default: 0 })
    totalIdleSeconds: number;

    @Column({ type: 'float', default: 0 })
    productivityScore: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
