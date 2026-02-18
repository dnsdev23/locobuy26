import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { ChatModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { GroupBuysModule } from './group-buys/group-buys.module';
import { SeedModule } from './seed/seed.module';
import { ImportModule } from './import/import.module';
import { User } from './entities/user.entity';
import { PickupLocation } from './entities/pickup-location.entity';
import { Product } from './entities/product.entity';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { GroupBuy } from './entities/group-buy.entity';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('DATABASE_HOST'),
                port: configService.get('DATABASE_PORT'),
                username: configService.get('DATABASE_USER'),
                password: configService.get('DATABASE_PASSWORD'),
                database: configService.get('DATABASE_NAME'),
                entities: [User, PickupLocation, Product, Conversation, Message, GroupBuy],
                synchronize: configService.get('NODE_ENV') === 'development', // Only in development
                logging: configService.get('NODE_ENV') === 'development',
            }),
        }),
        AuthModule,
        ProductsModule,
        ChatModule,
        GroupBuysModule,
        SeedModule,
        ImportModule,
    ],
})
export class AppModule { }
