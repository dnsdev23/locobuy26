import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { PickupLocation } from '../entities/pickup-location.entity';
import { User } from '../entities/user.entity';
import { Product } from '../entities/product.entity';

@Module({
    imports: [TypeOrmModule.forFeature([PickupLocation, User, Product])],
    controllers: [ImportController],
    providers: [ImportService],
})
export class ImportModule { }
