import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Enable CORS
    app.enableCors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
    });

    // Enable validation pipes globally
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
        }),
    );

    // Set global prefix
    app.setGlobalPrefix('api');

    const port = process.env.PORT || 3001;
    await app.listen(port);

    console.log(`🚀 Locobuy Backend running on http://localhost:${port}`);
    console.log(`📡 WebSocket server ready for connections`);
}

bootstrap();
