import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

interface MailData {
  text: string;
  subject: string;
  email: string;
}

@Injectable()
export class MailService {
  private readonly host: string;
  private readonly port: number;
  private readonly user: string;
  private readonly pass: string;
  private readonly secure: boolean;
  private readonly transporter: Transporter<SMTPTransport.SentMessageInfo>;

  constructor(private configService: ConfigService) {
    this.host = this.configService.get<string>('mail.host');
    this.port = this.configService.get<number>('mail.port');
    this.user = this.configService.get<string>('mail.user');
    this.pass = this.configService.get<string>('mail.pass');
    this.secure = false;

    const TRANSPORT_OPTIONS: SMTPTransport.Options = {
      host: this.host,
      port: this.port,
      secure: this.secure,
      auth: {
        user: this.user,
        pass: this.pass,
      },
    };

    this.transporter = nodemailer.createTransport(TRANSPORT_OPTIONS);
  }

  async sendMail(data: MailData) {
    const html = `
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Quizy Confirmation</title>
            <link rel="icon" type="image/x-icon" href="https://pub-6d20b939630549b9b08111f5340a825b.r2.dev/1861f909-c568-4713-b052-567cbf6660b0.png">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    text-align: center;
                    margin: 0;
                    padding: 20px;
                    background-color: #f4f4f4;
                }
                a {
                    text-decoration: none;
                }
                .container {
                    max-width: 600px;
                    margin: auto;
                    background: #fff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                .logo img {
                    width: 100%;
                    max-width: 200px;
                    height: auto;
                }
                .confirmation-code {
                    color: #1a73e8;
                    font-size: 24px;
                    font-weight: bold;
                }
                .social-icons {
                    margin-top: 20px;
                }
                .social-icons img {
                    width: 32px;
                    height: 32px;
                    margin: 0 10px;
                }
                .footer {
                    margin-top: 20px;
                    font-size: 12px;
                    color: #777;
                }
                @media (max-width: 600px) {
                    .container {
                        padding: 15px;
                    }
                    .confirmation-code {
                        font-size: 20px;
                    }
                    .social-icons img {
                        width: 28px;
                        height: 28px;
                        margin: 0 8px;
                    }
                }
            </style>
            </head>
            <body>
                <div class="container">
                    <div class="logo">
                        <img src="https://pub-6d20b939630549b9b08111f5340a825b.r2.dev/1861f909-c568-4713-b052-567cbf6660b0.png" alt="UstozAI Logo">
                    </div>
                    <h1>Tasdiqlash kodingiz: <span class="confirmation-code">${data.text}</span></h1>
                    <p>PlusFit platformasini tanlaganingiz uchun tashakkur! Ro‘yxatdan o‘tishni yakunlash uchun yuqoridagi tasdiqlash kodidan foydalaning. Agar siz ushbu kodni so‘ramagan bo‘lsangiz, ushbu xatga e’tibor bermang.</p>
                    <div class="social-icons">
                        <a href="https://www.instagram.com/plusfit_ai/">
                            <img src="https://upload.ustozai-app.uz/instagramLogo.png" alt="UstozAI Instagram">
                        </a>
                        <a href="https://t.me/plusfit_ai">
                            <img src="https://upload.ustozai-app.uz/telegramLogo.png" alt="UstozAI Telegram">
                        </a>
                    </div>
                    <div class="footer">
                        <p>© 2025 PlusFit. All rights reserved.</p>
                    </div>
                </div>
            </body>
        `;

    const info = await this.transporter.sendMail({
      from: this.user,
      to: data.email,
      subject: data.subject,
      html,
    });

    console.log('Message sent: %s', info.messageId);
  }
}
