import { IsIn } from 'class-validator';

export class CreateAvatarUploadUrlDto {
  @IsIn(['image/png', 'image/jpeg'])
  contentType: 'image/png' | 'image/jpeg';
}
