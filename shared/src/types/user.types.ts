import { z } from 'zod';
import { BaseEntity, Address, AddressSchema } from './common.types';
import { UserRole } from './auth.types';

// User profile schemas
export const UpdateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  avatar: z.string().optional(),
});

export const UpdateEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const AddAddressSchema = AddressSchema;

export const UpdateAddressSchema = AddressSchema.partial();

// Type definitions
export type UpdateProfileRequest = z.infer<typeof UpdateProfileSchema>;
export type UpdateEmailRequest = z.infer<typeof UpdateEmailSchema>;
export type AddAddressRequest = z.infer<typeof AddAddressSchema>;
export type UpdateAddressRequest = z.infer<typeof UpdateAddressSchema>;

// User interfaces
export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: Date;
  avatar?: string;
  role: UserRole;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  lastLoginAt?: Date;
  emailVerifiedAt?: Date;
  phoneVerifiedAt?: Date;
  twoFactorEnabled: boolean;
  preferences: UserPreferences;
  addresses: UserAddress[];
}

export interface UserAddress extends BaseEntity {
  userId: string;
  type: AddressType;
  label?: string;
  address: Address;
  isDefault: boolean;
}

export interface UserPreferences {
  language: string;
  currency: string;
  timezone: string;
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
}

export interface NotificationPreferences {
  email: {
    marketing: boolean;
    orderUpdates: boolean;
    securityAlerts: boolean;
    newsletter: boolean;
  };
  push: {
    orderUpdates: boolean;
    promotions: boolean;
    reminders: boolean;
  };
  sms: {
    orderUpdates: boolean;
    securityAlerts: boolean;
  };
}

export interface PrivacyPreferences {
  profileVisibility: 'public' | 'private' | 'friends';
  showEmail: boolean;
  showPhone: boolean;
  allowDataCollection: boolean;
  allowPersonalization: boolean;
}

// Address types
export enum AddressType {
  HOME = 'home',
  WORK = 'work',
  BILLING = 'billing',
  SHIPPING = 'shipping',
  OTHER = 'other',
}

// User activity
export interface UserActivity extends BaseEntity {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

// User statistics
export interface UserStats {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  favoriteCategories: string[];
  lastOrderDate?: Date;
  loyaltyPoints: number;
  accountAge: number; // in days
}

// User search and filtering
export interface UserSearchParams {
  query?: string;
  role?: UserRole;
  isActive?: boolean;
  isEmailVerified?: boolean;
  registeredAfter?: Date;
  registeredBefore?: Date;
  lastLoginAfter?: Date;
  lastLoginBefore?: Date;
}

export interface UserListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
  avatar?: string;
}

// Admin user management
export const CreateUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.nativeEnum(UserRole),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  sendWelcomeEmail: z.boolean().optional(),
});

export const UpdateUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
  isEmailVerified: z.boolean().optional(),
});

export type CreateUserRequest = z.infer<typeof CreateUserSchema>;
export type UpdateUserRequest = z.infer<typeof UpdateUserSchema>;

// User export/import
export interface UserExportData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  totalOrders: number;
  totalSpent: number;
}

// User invitation
export interface UserInvitation extends BaseEntity {
  email: string;
  role: UserRole;
  invitedBy: string;
  token: string;
  expiresAt: Date;
  acceptedAt?: Date;
  isUsed: boolean;
}

export const InviteUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.nativeEnum(UserRole),
  message: z.string().optional(),
});

export type InviteUserRequest = z.infer<typeof InviteUserSchema>;
