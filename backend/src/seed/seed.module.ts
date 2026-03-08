import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedController } from './seed.controller';
import { User } from '../entities/user.entity';
import { PickupLocation } from '../entities/pickup-location.entity';
import { Product } from '../entities/product.entity';
import { GroupBuy } from '../entities/group-buy.entity';
import { BlogPost } from '../entities/blog-post.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, PickupLocation, Product, GroupBuy, BlogPost])],
    controllers: [SeedController],
})
export class SeedModule { }
