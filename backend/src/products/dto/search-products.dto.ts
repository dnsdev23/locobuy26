import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchProductsDto {
    @Type(() => Number)
    @IsNumber()
    @Min(-90)
    @Max(90)
    latitude: number;

    @Type(() => Number)
    @IsNumber()
    @Min(-180)
    @Max(180)
    longitude: number;

    @Type(() => Number)
    @IsNumber()
    @Min(0.1)
    @Max(100)
    @IsOptional()
    radius?: number = 5;

    @IsString()
    @IsOptional()
    category?: string;

    @IsString()
    @IsOptional()
    search?: string;

    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @IsOptional()
    page?: number = 1;

    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(100)
    @IsOptional()
    limit?: number = 60;
}
