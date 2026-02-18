import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async register(dto: RegisterDto) {
        // Check if user already exists
        const existingUser = await this.userRepository.findOne({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new UnauthorizedException('Email already registered');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        // Create user
        const user = this.userRepository.create({
            ...dto,
            password: hashedPassword,
        });

        const savedUser = await this.userRepository.save(user);

        // Return user without password
        const { password, ...result } = savedUser;
        return {
            user: result,
            message: 'Registration successful',
        };
    }

    async login(dto: LoginDto) {
        // Find user
        const user = await this.userRepository.findOne({
            where: { email: dto.email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check if user is active
        if (!user.is_active) {
            throw new UnauthorizedException('Account is deactivated');
        }

        // Return user without password
        const { password, ...result } = user;
        return {
            user: result,
            message: 'Login successful',
        };
    }

    async findById(id: string) {
        const user = await this.userRepository.findOne({
            where: { id },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const { password, ...result } = user;
        return result;
    }

    async updateProfile(userId: string, updates: Partial<User>) {
        await this.userRepository.update(userId, updates);
        return this.findById(userId);
    }
}
