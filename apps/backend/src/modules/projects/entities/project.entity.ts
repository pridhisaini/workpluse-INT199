import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index, ManyToMany, JoinTable } from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { User } from '../../users/entities/user.entity';

@Entity('projects')
@Index(['organizationId', 'status'])
export class Project {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    organizationId: string;

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organizationId' })
    organization: Organization;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({ default: 'planning' })
    status: string;

    @Column({ type: 'timestamp', nullable: true })
    startDate: Date;

    @Column({ type: 'timestamp', nullable: true })
    endDate: Date;

    @Column({ type: 'float', nullable: true })
    budget: number;

    @Column({ type: 'float', default: 0 })
    progress: number;

    @ManyToMany(() => User)
    @JoinTable({
        name: 'project_members',
        joinColumn: { name: 'projectId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' }
    })
    members: User[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
