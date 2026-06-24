import { Injectable, Logger } from '@nestjs/common';
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly ses = new SESClient({ region: process.env.AWS_REGION });

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const url = `${process.env.FRONTEND_URL}/#/verify-email?token=${token}`;
    const subject = '【SNSアプリ】メールアドレスの確認';
    const body = [
      '以下のURLをクリックして、メールアドレスの確認を完了してください。',
      '',
      url,
      '',
      'このURLの有効期限は24時間です。',
    ].join('\n');

    if (process.env.MAIL_TRANSPORT === 'ses') {
      await this.ses.send(
        new SendEmailCommand({
          Source: process.env.MAIL_FROM,
          Destination: { ToAddresses: [to] },
          Message: {
            Subject: { Data: subject, Charset: 'UTF-8' },
            Body: { Text: { Data: body, Charset: 'UTF-8' } },
          },
        }),
      );
      return;
    }

    // MAIL_TRANSPORT="console"（開発用）: 送らずにログへ出力する
    this.logger.log(`メール送信（console） To: ${to}`);
    this.logger.log(`件名: ${subject}`);
    this.logger.log(`\n${body}\n`);
  }
}
