import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Get('me')
    async getProfile(@Req() req: any) {
        // In a real app, you'd extract userId from JWT token
        // For now, we'll use a simple approach
        const userId = req.headers['x-user-id'];
        if (!userId) {
            return { message: 'Not authenticated' };
        }
        return this.authService.findById(userId);
    }
}
