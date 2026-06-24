import { IsEmail, IsString, Length, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @Matches(/^[a-z0-9_]{3,20}$/, {
    message:
      'usernameは英小文字・数字・アンダースコアの3〜20文字で入力してください',
  })
  username: string;

  @IsString()
  @Length(1, 50)
  displayName: string;

  @IsString()
  @MinLength(8)
  password: string;
}
