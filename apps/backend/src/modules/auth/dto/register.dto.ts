import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { UserRole } from '../../users/entities/user.entity';

export class RegisterDto {
    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(8)
    password!: string;

    @IsString()
    @IsNotEmpty()
    firstName!: string;

    @IsString()
    @IsNotEmpty()
    lastName!: string;

    @IsUUID()
    @IsNotEmpty()
    organizationId!: string;

    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;
}
