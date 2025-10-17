import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import * as path from 'path';
import * as sharp from 'sharp';

import { ICreateFile } from './types';

@Injectable()
export class FileService {
  private client: S3Client;

  constructor(private configService: ConfigService) {
    const endpoint = this.configService.get('r2.endpoint');

    this.client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId: this.configService.get('r2.access'),
        secretAccessKey: this.configService.get('r2.secret'),
      },
    });
  }

  async create({ body, fileName, fileType }: ICreateFile) {
    const { url } = await this.upload({ body, fileName, fileType });

    return { data: url };
  }

  private async upload({ body, fileName, fileType }): Promise<{ url: string }> {
    const uniqueFileName = `${randomUUID()}${path.extname(fileName)}`;
    let processedBody = body;

    const isImage = fileType?.startsWith('image/');
    const sizeInKB = body.length / 1024;

    if (isImage && sizeInKB > 1000) {
      try {
        let sharpInstance = sharp(body).resize(2048, 2048, {
          fit: 'inside',
          withoutEnlargement: true,
        });

        if (fileType === 'image/jpeg' || fileType === 'image/jpg') {
          sharpInstance = sharpInstance.jpeg({
            quality: 95,
            progressive: true,
          });
        } else if (fileType === 'image/png') {
          sharpInstance = sharpInstance.png({
            quality: 95,
            compressionLevel: 9,
          });
        } else if (fileType === 'image/webp') {
          sharpInstance = sharpInstance.webp({ quality: 85 });
        } else {
          sharpInstance = sharpInstance.jpeg({
            quality: 95,
            progressive: true,
          });
        }

        processedBody = await sharpInstance.toBuffer();
      } catch (error) {
        console.error('Image compression failed:', error);
        processedBody = body;
      }
    }

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.configService.get('r2.bucket'),
        Key: uniqueFileName,
        ContentType: fileType,
        Body: processedBody,
      }),
    );

    return { url: uniqueFileName };
  }
}
