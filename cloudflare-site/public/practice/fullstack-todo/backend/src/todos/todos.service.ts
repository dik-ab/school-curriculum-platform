import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class TodosService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.todo.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const todo = await this.prisma.todo.findUnique({ where: { id } });
    if (todo === null) {
      throw new NotFoundException(`Todo (id: ${id}) は存在しません`);
    }
    return todo;
  }

  create(dto: CreateTodoDto) {
    return this.prisma.todo.create({
      data: { title: dto.title },
    });
  }

  async update(id: number, dto: UpdateTodoDto) {
    await this.findOne(id); // 存在しなければここで404
    return this.prisma.todo.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id); // 存在しなければここで404
    await this.prisma.todo.delete({ where: { id } });
  }
}
