import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const partnerSelect = {
  id: true,
  username: true,
  displayName: true,
  bio: true,
  avatarUrl: true,
};

@Injectable()
export class ConversationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreate(meId: number, username: string) {
    const partner = await this.prisma.user.findUnique({
      where: { username },
      select: partnerSelect,
    });
    if (partner === null) {
      throw new NotFoundException('ユーザーが見つかりません');
    }
    if (partner.id === meId) {
      throw new BadRequestException('自分自身との会話は作れません');
    }

    const [userOneId, userTwoId] =
      meId < partner.id ? [meId, partner.id] : [partner.id, meId];

    let conversation = await this.prisma.conversation.findUnique({
      where: { userOneId_userTwoId: { userOneId, userTwoId } },
    });
    if (conversation === null) {
      conversation = await this.prisma.conversation.create({
        data: { userOneId, userTwoId },
      });
    }

    const lastMessage = await this.prisma.message.findFirst({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'desc' },
    });

    return { id: conversation.id, partner, lastMessage };
  }

  async findMine(meId: number) {
    const conversations = await this.prisma.conversation.findMany({
      where: { OR: [{ userOneId: meId }, { userTwoId: meId }] },
      include: {
        userOne: { select: partnerSelect },
        userTwo: { select: partnerSelect },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });
    return conversations.map((conversation) => ({
      id: conversation.id,
      partner:
        conversation.userOneId === meId
          ? conversation.userTwo
          : conversation.userOne,
      lastMessage: conversation.messages[0] ?? null,
    }));
  }

  async findMessages(meId: number, conversationId: number) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (conversation === null) {
      throw new NotFoundException('会話が見つかりません');
    }
    if (conversation.userOneId !== meId && conversation.userTwoId !== meId) {
      throw new ForbiddenException('この会話には参加していません');
    }
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async isParticipant(userId: number, conversationId: number) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (conversation === null) {
      return false;
    }
    return (
      conversation.userOneId === userId || conversation.userTwoId === userId
    );
  }

  async createMessage(
    senderId: number,
    conversationId: number,
    content: string,
  ) {
    return this.prisma.message.create({
      data: { senderId, conversationId, content },
    });
  }
}
