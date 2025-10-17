import { RoleTypes } from '@prisma/client';

export interface ICurrentUser {
  id?: string;
  role?: RoleTypes;
}
