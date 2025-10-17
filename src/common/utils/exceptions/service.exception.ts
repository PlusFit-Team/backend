import {
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { BaseResponse } from 'common/dtos/base-response.dto';

export class ServiceExceptions {
  static handle(
    error: any,
    where: string,
    methodName: string,
  ): BaseResponse<null> {
    const logger = new Logger(ServiceExceptions.name);
    logger.error(
      `Where: [${where}], method: [${methodName}], Error: ${error.message || error}`,
    );

    if (error instanceof HttpException) {
      throw error;
    }

    throw new InternalServerErrorException('Something went wrong');
  }
}
