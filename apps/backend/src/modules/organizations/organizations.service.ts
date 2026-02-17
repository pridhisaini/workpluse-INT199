import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';

@Injectable()
export class OrganizationsService {
    constructor(
        @InjectRepository(Organization)
        private organizationsRepository: Repository<Organization>,
    ) { }

    async findAll(): Promise<Organization[]> {
        return this.organizationsRepository.find();
    }

    async findOne(id: string): Promise<Organization | null> {
        return this.organizationsRepository.findOne({ where: { id } });
    }

    async findBySlug(slug: string): Promise<Organization | null> {
        return this.organizationsRepository.findOne({ where: { slug } });
    }

    async create(createData: Partial<Organization>): Promise<Organization> {
        const org = this.organizationsRepository.create(createData);
        return this.organizationsRepository.save(org);
    }

    async update(id: string, updateData: Partial<Organization>): Promise<Organization | null> {
        await this.organizationsRepository.update(id, updateData);
        return this.findOne(id);
    }
}
