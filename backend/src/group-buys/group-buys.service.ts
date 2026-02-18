import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { GroupBuy, GroupBuyStatus } from '../entities/group-buy.entity';
import { CreateGroupBuyDto, JoinGroupBuyDto } from './dto/group-buy.dto';

@Injectable()
export class GroupBuysService {
    constructor(
        @InjectRepository(GroupBuy)
        private groupBuyRepository: Repository<GroupBuy>,
    ) { }

    async create(dto: CreateGroupBuyDto): Promise<GroupBuy> {
        const groupBuy = this.groupBuyRepository.create({
            ...dto,
            current_quantity: 0,
            status: GroupBuyStatus.ACTIVE,
        });

        return this.groupBuyRepository.save(groupBuy);
    }

    async findActive(): Promise<GroupBuy[]> {
        const now = new Date();

        return this.groupBuyRepository.find({
            where: {
                status: GroupBuyStatus.ACTIVE,
                start_time: LessThan(now),
                end_time: MoreThan(now),
            },
            relations: ['product', 'product.pickup_location', 'organizer'],
            order: {
                created_at: 'DESC',
            },
        });
    }

    async findOne(id: string): Promise<GroupBuy> {
        const groupBuy = await this.groupBuyRepository.findOne({
            where: { id },
            relations: ['product', 'product.pickup_location', 'organizer'],
        });

        if (!groupBuy) {
            throw new NotFoundException('Group buy not found');
        }

        return groupBuy;
    }

    async join(dto: JoinGroupBuyDto): Promise<{ groupBuy: GroupBuy; message: string }> {
        const groupBuy = await this.findOne(dto.group_buy_id);

        // Check if group buy is still active
        if (groupBuy.status !== GroupBuyStatus.ACTIVE) {
            throw new BadRequestException('This group buy is no longer active');
        }

        // Check if end time has passed
        if (new Date() > groupBuy.end_time) {
            // Update status to expired
            groupBuy.status = GroupBuyStatus.EXPIRED;
            await this.groupBuyRepository.save(groupBuy);
            throw new BadRequestException('This group buy has expired');
        }

        // Check if there's enough capacity
        const newQuantity = groupBuy.current_quantity + dto.quantity;
        if (newQuantity > groupBuy.target_quantity) {
            throw new BadRequestException(
                `Only ${groupBuy.target_quantity - groupBuy.current_quantity} spots remaining`
            );
        }

        // Update current quantity
        groupBuy.current_quantity = newQuantity;

        // Check if target is met
        if (groupBuy.current_quantity >= groupBuy.target_quantity) {
            groupBuy.status = GroupBuyStatus.COMPLETED;
        }

        await this.groupBuyRepository.save(groupBuy);

        const message = groupBuy.status === GroupBuyStatus.COMPLETED
            ? '🎉 Congratulations! The group buy target has been met!'
            : `Successfully joined! ${groupBuy.target_quantity - groupBuy.current_quantity} spots remaining.`;

        return { groupBuy, message };
    }

    async getProgress(id: string): Promise<{
        current: number;
        target: number;
        percentage: number;
        remaining: number;
    }> {
        const groupBuy = await this.findOne(id);

        return {
            current: groupBuy.current_quantity,
            target: groupBuy.target_quantity,
            percentage: (groupBuy.current_quantity / groupBuy.target_quantity) * 100,
            remaining: groupBuy.target_quantity - groupBuy.current_quantity,
        };
    }
}
