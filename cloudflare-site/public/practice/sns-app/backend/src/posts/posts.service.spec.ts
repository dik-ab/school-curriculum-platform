import { Test } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PostsService', () => {
  let service: PostsService;

  const mockPrisma = {
    post: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = moduleRef.get(PostsService);
  });

  describe('create', () => {
    it('ログイン中のユーザーをauthorIdとして投稿を作成する', async () => {
      mockPrisma.post.create.mockResolvedValue({
        id: 1,
        content: 'テスト投稿です',
        authorId: 10,
        createdAt: new Date(),
      });

      await service.create(10, 'テスト投稿です');

      expect(mockPrisma.post.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            content: 'テスト投稿です',
            authorId: 10,
          }),
        }),
      );
    });
  });

  describe('remove', () => {
    it('存在しない投稿はNotFoundExceptionを投げ、削除しない', async () => {
      mockPrisma.post.findUnique.mockResolvedValue(null);

      await expect(service.remove(10, 999)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.post.delete).not.toHaveBeenCalled();
    });

    it('他人の投稿はForbiddenExceptionを投げ、削除しない', async () => {
      mockPrisma.post.findUnique.mockResolvedValue({
        id: 1,
        content: '他人の投稿',
        authorId: 99,
        createdAt: new Date(),
      });

      await expect(service.remove(10, 1)).rejects.toThrow(ForbiddenException);
      expect(mockPrisma.post.delete).not.toHaveBeenCalled();
    });

    it('自分の投稿なら削除できる', async () => {
      mockPrisma.post.findUnique.mockResolvedValue({
        id: 1,
        content: '自分の投稿',
        authorId: 10,
        createdAt: new Date(),
      });
      mockPrisma.post.delete.mockResolvedValue({ id: 1 });

      await service.remove(10, 1);

      expect(mockPrisma.post.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
