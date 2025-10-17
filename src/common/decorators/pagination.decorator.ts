import { applyDecorators } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export function Page() {
  return applyDecorators(
    ApiPropertyOptional(),
    Transform(({ value }) => parseInt(value as string)),
    IsNumber(),
    IsOptional(),
    Min(1),
  );
}

export function Limit() {
  return applyDecorators(
    ApiPropertyOptional(),
    Transform(({ value }) => parseInt(value as string)),
    IsNumber(),
    IsOptional(),
    Max(600),
    Min(1),
  );
}
