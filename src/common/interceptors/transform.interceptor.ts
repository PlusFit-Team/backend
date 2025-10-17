import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as RXOperators from 'rxjs/operators';

export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      RXOperators.map((data) => {
        const statusCode = context.switchToHttp().getResponse().statusCode;
        return {
          statusCode,
          message: statusCode >= 200 && statusCode < 300 ? 'OK' : 'ERROR',
          data,
        };
      }),
    );
  }
}
