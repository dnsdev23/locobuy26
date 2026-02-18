import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { GroupBuysService } from './group-buys.service';
import { CreateGroupBuyDto, JoinGroupBuyDto } from './dto/group-buy.dto';

@Controller('group-buys')
export class GroupBuysController {
    constructor(private readonly groupBuysService: GroupBuysService) { }

    @Post()
    create(@Body() dto: CreateGroupBuyDto) {
        return this.groupBuysService.create(dto);
    }

    @Get('active')
    findActive() {
        return this.groupBuysService.findActive();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.groupBuysService.findOne(id);
    }

    @Post('join')
    join(@Body() dto: JoinGroupBuyDto) {
        return this.groupBuysService.join(dto);
    }

    @Get(':id/progress')
    getProgress(@Param('id') id: string) {
        return this.groupBuysService.getProgress(id);
    }
}
