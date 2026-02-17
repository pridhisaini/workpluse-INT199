import { IsUUID, IsOptional, IsString } from 'class-validator';

export class StartSessionDto {
    @IsUUID()
    @IsOptional()
    projectId?: string;

    @IsString()
    @IsOptional()
    task?: string;

    @IsString()
    @IsOptional()
    description?: string;
}
