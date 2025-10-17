import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import * as crypto from 'node:crypto';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async save(key: string, data: string, ttl: number = 180): Promise<void> {
    await this.cacheManager.set(key, data, ttl * 1000);
  }

  async verifyOtp(key: string, otpCode: string): Promise<boolean> {
    const otpData = await this.cacheManager.get<string>(key);
    if (!otpData) {
      throw new BadRequestException(
        'Tasdiqlash kodi noto‘g‘ri yoki muddati o‘tgan',
      );
    }

    const { otp, try: remainingAttemptsOriginal } = JSON.parse(otpData);
    let remainingAttempts = remainingAttemptsOriginal;

    if (otp !== otpCode) {
      remainingAttempts -= 1;

      if (remainingAttempts <= 0) {
        await this.delete(key);
        throw new BadRequestException(
          'Maksimal urinishlar soni o‘tdi. Iltimos, qayta urinib ko‘ring.',
        );
      }

      // Urinishlar sonini yangilaymiz
      const updatedData = JSON.stringify({ otp, try: remainingAttempts });
      await this.save(key, updatedData); // Yangi ma'lumotni saqlaymiz

      throw new BadRequestException('Kod xato kiritildi');
    }

    return true;
  }

  async sendOtp(): Promise<{ keyHash: string; otp: string }> {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const hex = crypto.randomBytes(32).toString('hex');
    const keyHash = crypto.createHash('sha256').update(hex).digest('hex');
    const data = { otp, try: 5 };
    await this.save(keyHash, JSON.stringify(data));

    return { keyHash, otp };
  }

  async getData(key: string) {
    return await this.cacheManager.get<string>(key);
  }

  async delete(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async deleteByPattern(pattern: string): Promise<void> {
    const store = (this.cacheManager as any).store;

    // For Keyv with Redis store
    if (store && store.namespace) {
      const keys: string[] = await store.opts.store.keys(
        `${store.namespace}:*${pattern}*`,
      );
      if (keys.length === 0) return;
      await Promise.all(
        keys.map((key) =>
          this.cacheManager.del(key.replace(`${store.namespace}:`, '')),
        ),
      );
    }
  }
}
