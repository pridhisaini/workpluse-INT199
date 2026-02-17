import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
        @InjectRepository(RefreshToken)
        private refreshTokenRepository: Repository<RefreshToken>,
    ) { }

    async register(dto: RegisterDto) {
        const existing = await this.usersService.findByEmail(dto.email);
        if (existing) {
            throw new ConflictException('User already exists');
        }

        const user = await this.usersService.create(dto);

        return this.generateTokens(user);
    }

    async login(dto: LoginDto) {
        console.log(`[AuthService] Attempting login for: ${dto.email}`);
        const user = await this.usersService.findByEmail(dto.email);
        if (!user || !(await bcrypt.compare(dto.password, user.password))) {
            console.warn(`[AuthService] Invalid credentials for: ${dto.email}`);
            throw new UnauthorizedException('Invalid credentials');
        }

        console.log(`[AuthService] Login successful for: ${dto.email}`);
        return this.generateTokens(user);
    }

    async refreshTokens(refreshTokenStr: string) {
        const token = await this.refreshTokenRepository.findOne({
            where: { token: refreshTokenStr, isRevoked: false },
            relations: ['user'],
        });

        if (!token || token.expiresAt < new Date()) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        // Revoke old token
        token.isRevoked = true;
        await this.refreshTokenRepository.save(token);

        return this.generateTokens(token.user);
    }

    private async generateTokens(user: User) {
        console.log(`[AuthService] Generating tokens for user: ${user.email} (${user.id})`);
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            orgId: user.organizationId
        };

        const accessToken = this.jwtService.sign(payload);

        const refreshTokenStr = this.jwtService.sign(payload, {
            expiresIn: this.configService.get('jwt.refreshExpiresIn') || '7d',
        });

        const refreshToken = this.refreshTokenRepository.create({
            token: refreshTokenStr,
            userId: user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        });

        await this.refreshTokenRepository.save(refreshToken);
        console.log(`[AuthService] Tokens and refresh record saved for user: ${user.email}`);

        const { password, ...userWithoutPassword } = user;

        return {
            tokens: {
                accessToken,
                refreshToken: refreshTokenStr,
            },
            user: userWithoutPassword,
        };
    }
}
