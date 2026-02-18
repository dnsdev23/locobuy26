import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';
import { PickupLocation } from '../entities/pickup-location.entity';
import { SearchProductsDto } from './dto/search-products.dto';
import { CreateProductDto } from './dto/create-product.dto';

interface ProductWithDistance extends Omit<Product, 'pickup_location'> {
    distance: number;
    pickup_location: {
        id: string;
        name: string;
        address: string;
        latitude: number;
        longitude: number;
        distance: number;
    };
}

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(PickupLocation)
        private locationsRepository: Repository<PickupLocation>,
    ) { }

    /**
     * Find products within a given radius using PostGIS ST_DWithin
     * This is optimized for spatial queries and uses the geometry index
     */
    async searchNearby(dto: SearchProductsDto): Promise<{
        products: ProductWithDistance[];
        total: number;
        page: number;
        limit: number;
    }> {
        const { latitude, longitude, radius, category, search, page, limit } = dto;

        // Create a point from user's location
        const userPoint = `POINT(${longitude} ${latitude})`;

        // Convert radius from km to meters for ST_DWithin
        const radiusInMeters = radius * 1000;

        // Build the query
        let query = this.productsRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.pickup_location', 'location')
            .leftJoinAndSelect('product.seller', 'seller')
            .where('product.is_available = :isAvailable', { isAvailable: true })
            .andWhere(
                `ST_DWithin(
          location.location::geography,
          ST_GeomFromText(:userPoint, 4326)::geography,
          :radius
        )`,
                { userPoint, radius: radiusInMeters }
            )
            // Calculate distance for sorting and display
            .addSelect(
                `ST_Distance(
          location.location::geography,
          ST_GeomFromText(:userPoint, 4326)::geography
        ) / 1000`,
                'distance'
            );

        // Add category filter if provided
        if (category) {
            query = query.andWhere('product.category = :category', { category });
        }

        // Add search filter if provided
        if (search) {
            query = query.andWhere(
                '(product.name ILIKE :search OR product.description ILIKE :search)',
                { search: `%${search}%` }
            );
        }

        // Get total count
        const total = await query.getCount();

        // Add pagination and ordering
        const products = await query
            .orderBy('distance', 'ASC')
            .skip((page - 1) * limit)
            .take(limit)
            .getRawAndEntities();

        // Map results to include distance
        const productsWithDistance: ProductWithDistance[] = products.entities.map((product, index) => {
            const distance = parseFloat(products.raw[index].distance);
            return {
                ...product,
                distance,
                pickup_location: {
                    ...product.pickup_location,
                    distance,
                },
            };
        });

        return {
            products: productsWithDistance,
            total,
            page,
            limit,
        };
    }

    async findOne(id: string): Promise<Product> {
        return this.productsRepository.findOne({
            where: { id },
            relations: ['pickup_location', 'seller'],
        });
    }

    async create(dto: CreateProductDto): Promise<Product> {
        const seller = await this.usersRepository.findOne({ where: { id: dto.seller_id } });
        if (!seller) throw new NotFoundException('Seller not found');

        const location = await this.locationsRepository.findOne({ where: { id: dto.pickup_location_id } });
        if (!location) throw new NotFoundException('Pickup location not found');

        const product = this.productsRepository.create({
            name: dto.name,
            description: dto.description,
            price: dto.price,
            category: dto.category,
            external_link: dto.original_url || dto.external_link,
            image_urls: dto.image_urls && dto.image_urls.length > 0 ? dto.image_urls : (dto.image_url ? [dto.image_url] : []),
            is_available: dto.is_available ?? true,
            seller,
            pickup_location: location,
        });

        return this.productsRepository.save(product);
    }
}
