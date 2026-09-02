import { SetMetadata } from '@nestjs/common';
import { ResourceCategory, PermissionAction } from '../types/permissions.type';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Controller yoki Endpointlarga ma'lum bir ruxsatni so'rash uchun ishlatiladi.
 * @param category Resurs nomi (ResourceCategory enum dan)
 * @param action Amal turi (PermissionAction enum dan)
 */
export const RequirePermissions = (category: ResourceCategory, action: PermissionAction) =>
  SetMetadata(PERMISSIONS_KEY, { category, action });
