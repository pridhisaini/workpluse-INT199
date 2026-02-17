import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsJSON } from 'class-validator';

export enum ActivityType {
    ACTIVE = 'active',
    IDLE = 'idle',
}

export class CreateActivityDto {
    @IsEnum(ActivityType)
    @IsNotEmpty()
    type!: ActivityType;

    @IsString()
    @IsNotEmpty()
    action!: string;

    @IsOptional()
    @IsString()
    details?: string;

    @IsNumber()
    @IsNotEmpty()
    timestamp!: number; // Unix timestamp in ms
}
