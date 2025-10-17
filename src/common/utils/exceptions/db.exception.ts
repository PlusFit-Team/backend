import { HttpStatus, Logger } from '@nestjs/common';
import { BaseResponse } from 'common/dtos/base-response.dto';

export class DbExceptions {
  static handle(err: any): BaseResponse<null> {
    const logger = new Logger(DbExceptions.name);

    logger.error(err);
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      data: null,
      message: err.message,
    };
  }
}
