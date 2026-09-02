import { User } from "@prisma/client";

export enum UserRoles {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  MENTOR = 'MENTOR',
  ASSISTANT = 'ASSISTANT',
  STUDENT = 'STUDENT',
}

export type TAuthUser = Omit<User, 'password'>;
