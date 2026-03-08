import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogPost } from '../entities/blog-post.entity';

@Injectable()
export class BlogService {
    constructor(
        @InjectRepository(BlogPost)
        private blogPostsRepository: Repository<BlogPost>,
    ) { }

    async findPublished(): Promise<BlogPost[]> {
        return this.blogPostsRepository.find({
            where: { is_published: true },
            relations: ['author'],
            order: { created_at: 'DESC' },
        });
    }
}
