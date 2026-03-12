import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  constructor(private readonly mailerService: MailerService) {}
  async sendRecoveryPasswordEmail(to: string, token: string) {
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Recover Password',
        template: 'recovery-password',
        context: {
          token,
        },
      });
    } catch (error) {
      this.logger.error('Error sending recovery password email', error);
      throw new Error('Failed to send recovery password email');
    }
  }
}
