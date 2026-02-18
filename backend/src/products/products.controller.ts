import { Controller, Get, Post, Body, Query, ValidationPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { SearchProductsDto } from './dto/search-products.dto';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    async create(@Body(new ValidationPipe({ transform: true })) dto: CreateProductDto) {
        return this.productsService.create(dto);
    }

    @Get('search')
    async searchNearby(
        @Query(new ValidationPipe({ transform: true })) dto: SearchProductsDto,
    ) {
        return this.productsService.searchNearby(dto);
    }

    @Get(':id')
    async findOne(@Query('id') id: string) {
        return this.productsService.findOne(id);
    }
}
