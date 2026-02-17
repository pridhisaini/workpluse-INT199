import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, Index, JoinColumn } from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';

export enum UserRole {
    ADMIN = 'admin',
    MANAGER = 'manager',
    EMPLOYEE = 'employee',
}

@Entity('users')
@Index(['organizationId', 'email'], { unique: true })
@Index(['id', 'status'])
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    organizationId: string;

    @ManyToOne(() => Organization, (org) => org.users)
    @JoinColumn({ name: 'organizationId' })
    organization: Organization;

    @Column()
    email: string;

    @Column({ select: false })
    password: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ nullable: true })
    avatar: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.EMPLOYEE,
    })
    role: UserRole;

    @Column({ default: 'active' })
    status: string;

    @Column({ nullable: true })
    department: string;

    @Column({ nullable: true })
    designation: string;

    @Column({ nullable: true })
    phone: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
