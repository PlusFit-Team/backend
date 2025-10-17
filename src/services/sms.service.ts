import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SmsService {
  private readonly smsApi: string;
  private readonly smsPassword: string;
  private readonly smsEmail: string;

  constructor(private readonly configService: ConfigService) {
    this.smsApi = this.configService.get<string>('sms.api')!;
    this.smsPassword = this.configService.get<string>('sms.password')!;
    this.smsEmail = this.configService.get<string>('sms.email')!;
  }

  private async fetchAuthToken(): Promise<string> {
    const response = await axios.post(`${this.smsApi}/auth/login`, {
      email: this.smsEmail,
      password: this.smsPassword,
    });
    return response.data.data.token;
  }

  async sendSms(message: string, phoneNumber: string): Promise<any> {
    const token = await this.fetchAuthToken();
    const payload = {
      mobile_phone: phoneNumber,
      message: `"Ustoz AI" tizimiga kirish uchun tasdiqlash kod: ${message}. fw2y/uAHdeI`,
      from: 'UstozAI',
    };

    const response = await axios.post(
      `${this.smsApi}/message/sms/send`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  }
}
