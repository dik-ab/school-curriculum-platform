import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/jwt-payload';
import { CreateAvatarUploadUrlDto } from './dto/create-avatar-upload-url.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me')
  updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.sub, dto);
  }

  @Post('me/avatar-upload-url')
  createAvatarUploadUrl(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateAvatarUploadUrlDto,
  ) {
    return this.usersService.createAvatarUploadUrl(user.sub, dto.contentType);
  }

  @Get(':username')
  findProfile(
    @CurrentUser() user: JwtPayload,
    @Param('username') username: string,
  ) {
    return this.usersService.findProfile(user.sub, username);
  }

  @Get(':username/posts')
  findPosts(
    @CurrentUser() user: JwtPayload,
    @Param('username') username: string,
  ) {
    return this.usersService.findPosts(user.sub, username);
  }

  @Post(':username/follow')
  follow(@CurrentUser() user: JwtPayload, @Param('username') username: string) {
    return this.usersService.follow(user.sub, username);
  }

  @Delete(':username/follow')
  @HttpCode(204)
  unfollow(
    @CurrentUser() user: JwtPayload,
    @Param('username') username: string,
  ) {
    return this.usersService.unfollow(user.sub, username);
  }
}
