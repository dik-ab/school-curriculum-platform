import {
  Controller,
  Delete,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtPayload } from '../auth/jwt-payload';
import { LikesService } from './likes.service';

@UseGuards(JwtAuthGuard)
@Controller('posts/:id/likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post()
  @HttpCode(204)
  like(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseIntPipe) postId: number,
  ) {
    return this.likesService.like(user.sub, postId);
  }

  @Delete()
  @HttpCode(204)
  unlike(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseIntPipe) postId: number,
  ) {
    return this.likesService.unlike(user.sub, postId);
  }
}
