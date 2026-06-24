import {
  IsOptional,
  IsString,
  IsUrl,
  Length,
  MaxLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  bio?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}
