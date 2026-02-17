import { IsNotEmpty, IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class LogManualSessionDto {
    @IsNotEmpty()
    @IsString()
    projectId: string;

    @IsNotEmpty()
    @IsString()
    task: string;

    @IsNotEmpty()
    @IsDateString()
    startTime: string;

    @IsNotEmpty()
    @IsDateString()
    endTime: string;

    @IsOptional()
    @IsString()
    description?: string;
}
