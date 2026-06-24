import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { PostsModule } from './posts/posts.module';
import { LikesModule } from './likes/likes.module';
import { UsersModule } from './users/users.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    MailModule,
    PostsModule,
    LikesModule,
    UsersModule,
    ChatModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
