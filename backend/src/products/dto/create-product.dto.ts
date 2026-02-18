import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, IsUrl, IsBoolean, Min } from 'class-validator';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @Min(0)
    price: number;

    @IsString()
    @IsOptional()
    category?: string;

    @IsString()
    @IsOptional()
    image_url?: string;

    @IsArray()
    @IsOptional()
    image_urls?: string[];

    @IsString()
    @IsNotEmpty()
    pickup_location_id: string;

    @IsString()
    @IsNotEmpty()
    seller_id: string;

    // We accept both for compatibility
    @IsString()
    @IsOptional()
    original_url?: string;

    @IsString()
    @IsOptional()
    external_link?: string;

    @IsBoolean()
    @IsOptional()
    is_available?: boolean;
}
