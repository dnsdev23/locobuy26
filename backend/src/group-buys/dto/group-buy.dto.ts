import { IsString, IsNumber, IsDate, IsUUID, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGroupBuyDto {
    @IsString()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @Min(2)
    target_quantity: number;

    @IsNumber()
    @Min(0.01)
    price_per_unit: number;

    @Type(() => Date)
    @IsDate()
    start_time: Date;

    @Type(() => Date)
    @IsDate()
    end_time: Date;

    @IsUUID()
    product_id: string;

    @IsUUID()
    organizer_id: string;
}

export class JoinGroupBuyDto {
    @IsUUID()
    group_buy_id: string;

    @IsUUID()
    user_id: string;

    @IsNumber()
    @Min(1)
    quantity: number;
}
