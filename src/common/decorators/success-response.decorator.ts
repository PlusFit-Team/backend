import { Type, applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiProperty,
  getSchemaPath,
} from '@nestjs/swagger';

class BaseResponseDto<T> {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'OK' })
  message: string;

  @ApiProperty()
  data: T;
}

export const ApiSuccessResponse = <DataDto extends Type<unknown>>(
  dataDto: DataDto,
  isArray?: boolean,
) =>
  applyDecorators(
    ApiExtraModels(BaseResponseDto, dataDto),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(BaseResponseDto) },
          {
            properties: {
              data: isArray
                ? { type: 'array', items: { $ref: getSchemaPath(dataDto) } }
                : { $ref: getSchemaPath(dataDto) },
            },
          },
        ],
      },
    }),
  );
