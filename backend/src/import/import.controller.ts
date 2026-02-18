import { Controller, Post, Body, Get, Query, BadRequestException } from '@nestjs/common';
import { ImportService } from './import.service';

@Controller('import')
export class ImportController {
    constructor(private readonly importService: ImportService) { }

    @Post('parse')
    async parseUrl(@Body('url') url: string) {
        if (!url) {
            throw new BadRequestException('URL is required');
        }
        return this.importService.parseProduct(url);
    }

    @Get('locations')
    async getLocations() {
        return this.importService.getLocations();
    }

    @Get('users')
    async getUsers() {
        return this.importService.getUsers();
    }
    @Post('batch')
    async batchImport(@Body('urls') urls: string[]) {
        if (!urls || !Array.isArray(urls)) {
            throw new BadRequestException('URLs array is required');
        }
        return this.importService.batchImport(urls);
    }
    @Get('shop')
    async getShopProducts(@Query('url') url: string) {
        if (!url) {
            throw new BadRequestException('Shop URL is required');
        }
        return this.importService.fetchShopProducts(url);
    }
}
