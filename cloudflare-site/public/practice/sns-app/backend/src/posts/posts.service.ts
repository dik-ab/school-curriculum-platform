import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const authorSelect = {
  id: true,
  username: true,
  displayName: true,
  bio: true,
  avatarUrl: true,
} as const;

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  create(authorId: number, content: string) {
    return this.prisma.post.create({
      data: { authorId, content },
      include: { author: { select: authorSelect } },
    });
  }

  async findAll(userId: number) {
    const posts = await this.prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: authorSelect },
        _count: { select: { likes: true } },
        likes: { where: { userId }, select: { userId: true } },
      },
    });
    return posts.map((post) => ({
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,
      author: post.author,
      likeCount: post._count.likes,
      likedByMe: post.likes.length > 0,
    }));
  }

  async findTimeline(userId: number) {
    const follows = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followeeId: true },
    });
    const followeeIds = follows.map((follow) => follow.followeeId);

    const posts = await this.prisma.post.findMany({
      where: { authorId: { in: [...followeeIds, userId] } },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: authorSelect },
        _count: { select: { likes: true } },
        likes: { where: { userId } },
      },
    });

    return posts.map((post) => ({
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,
      author: post.author,
      likeCount: post._count.likes,
      likedByMe: post.likes.length > 0,
    }));
  }

  async remove(userId: number, postId: number) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });
    if (!post) {
      throw new NotFoundException('投稿が見つかりません');
    }
    if (post.authorId !== userId) {
      throw new ForbiddenException('自分の投稿しか削除できません');
    }
    await this.prisma.post.delete({ where: { id: postId } });
  }
}
