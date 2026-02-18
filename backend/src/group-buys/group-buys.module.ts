import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupBuysController } from './group-buys.controller';
import { GroupBuysService } from './group-buys.service';
import { GroupBuy } from '../entities/group-buy.entity';

@Module({
    imports: [TypeOrmModule.forFeature([GroupBuy])],
    controllers: [GroupBuysController],
    providers: [GroupBuysService],
    exports: [GroupBuysService],
})
export class GroupBuysModule { }
