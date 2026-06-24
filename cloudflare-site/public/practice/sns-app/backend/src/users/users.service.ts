import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

const authorSelect = {
  id: true,
  username: true,
  displayName: true,
  bio: true,
  avatarUrl: true,
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly s3 = new S3Client({ region: process.env.AWS_REGION });

  async findProfile(currentUserId: number, username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        _count: { select: { followers: true, following: true } },
        followers: { where: { followerId: currentUserId } },
      },
    });
    if (user === null) {
      throw new NotFoundException('ユーザーが見つかりません');
    }
    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      followersCount: user._count.followers,
      followingCount: user._count.following,
      isFollowing: user.followers.length > 0,
    };
  }

  async findPosts(currentUserId: number, username: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (user === null) {
      throw new NotFoundException('ユーザーが見つかりません');
    }
    const posts = await this.prisma.post.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: authorSelect },
        _count: { select: { likes: true } },
        likes: { where: { userId: currentUserId } },
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

  async follow(followerId: number, username: string) {
    const followee = await this.prisma.user.findUnique({ where: { username } });
    if (followee === null) {
      throw new NotFoundException('ユーザーが見つかりません');
    }
    if (followee.id === followerId) {
      throw new BadRequestException('自分自身はフォローできません');
    }
    try {
      await this.prisma.follow.create({
        data: { followerId, followeeId: followee.id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('すでにフォローしています');
      }
      throw error;
    }
    return { following: true };
  }

  async unfollow(followerId: number, username: string) {
    const followee = await this.prisma.user.findUnique({ where: { username } });
    if (followee === null) {
      throw new NotFoundException('ユーザーが見つかりません');
    }
    try {
      await this.prisma.follow.delete({
        where: {
          followerId_followeeId: { followerId, followeeId: followee.id },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('フォローしていません');
      }
      throw error;
    }
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
      },
    });
  }

  async createAvatarUploadUrl(
    userId: number,
    contentType: 'image/png' | 'image/jpeg',
  ) {
    const bucket = process.env.AVATAR_BUCKET;
    const region = process.env.AWS_REGION;
    const ext = contentType === 'image/png' ? 'png' : 'jpg';
    const key = `avatars/${userId}/${Date.now()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });
    const uploadUrl = await getSignedUrl(this.s3, command, {
      expiresIn: 300,
    });
    const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

    return { uploadUrl, publicUrl };
  }
}
