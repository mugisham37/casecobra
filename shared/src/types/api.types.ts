import { z } from 'zod';

// Generic API response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  meta?: ApiMeta;
}

// API metadata for pagination, etc.
export interface ApiMeta {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  timestamp?: string;
  requestId?: string;
  version?: string;
}

// Error response structure
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  field?: string;
  timestamp: string;
  path: string;
  requestId?: string;
}

// Validation error structure
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
  code: string;
}

// API endpoint definitions
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    CHANGE_PASSWORD: '/auth/change-password',
    TWO_FACTOR: {
      SETUP: '/auth/2fa/setup',
      VERIFY: '/auth/2fa/verify',
      DISABLE: '/auth/2fa/disable',
      BACKUP_CODES: '/auth/2fa/backup-codes',
    },
  },

  // Users
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    UPDATE_EMAIL: '/users/email',
    ADDRESSES: '/users/addresses',
    PREFERENCES: '/users/preferences',
    ACTIVITY: '/users/activity',
    STATS: '/users/stats',
    EXPORT: '/users/export',
    INVITE: '/users/invite',
    BULK: '/users/bulk',
  },

  // Products
  PRODUCTS: {
    BASE: '/products',
    SEARCH: '/products/search',
    FEATURED: '/products/featured',
    CATEGORIES: '/products/categories',
    BRANDS: '/products/brands',
    REVIEWS: '/products/:id/reviews',
    VARIANTS: '/products/:id/variants',
    IMAGES: '/products/:id/images',
    BULK: '/products/bulk',
    EXPORT: '/products/export',
    IMPORT: '/products/import',
  },

  // Categories
  CATEGORIES: {
    BASE: '/categories',
    TREE: '/categories/tree',
    PRODUCTS: '/categories/:id/products',
  },

  // Brands
  BRANDS: {
    BASE: '/brands',
    PRODUCTS: '/brands/:id/products',
  },

  // Orders
  ORDERS: {
    BASE: '/orders',
    SEARCH: '/orders/search',
    ANALYTICS: '/orders/analytics',
    EXPORT: '/orders/export',
    FULFILLMENT: '/orders/:id/fulfillment',
    RETURNS: '/orders/:id/returns',
    NOTIFICATIONS: '/orders/:id/notifications',
    TRACKING: '/orders/:id/tracking',
  },

  // Cart
  CART: {
    BASE: '/cart',
    ITEMS: '/cart/items',
    CLEAR: '/cart/clear',
    APPLY_COUPON: '/cart/coupon',
    REMOVE_COUPON: '/cart/coupon',
    ESTIMATE_SHIPPING: '/cart/shipping/estimate',
  },

  // Checkout
  CHECKOUT: {
    BASE: '/checkout',
    SHIPPING_METHODS: '/checkout/shipping-methods',
    PAYMENT_METHODS: '/checkout/payment-methods',
    CALCULATE: '/checkout/calculate',
    PROCESS: '/checkout/process',
  },

  // Coupons
  COUPONS: {
    BASE: '/coupons',
    VALIDATE: '/coupons/validate',
    APPLY: '/coupons/apply',
  },

  // Wishlist
  WISHLIST: {
    BASE: '/wishlist',
    ITEMS: '/wishlist/items',
    SHARE: '/wishlist/share',
  },

  // Admin
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    PRODUCTS: '/admin/products',
    ORDERS: '/admin/orders',
    ANALYTICS: '/admin/analytics',
    SETTINGS: '/admin/settings',
    REPORTS: '/admin/reports',
  },

  // File uploads
  UPLOADS: {
    BASE: '/uploads',
    IMAGES: '/uploads/images',
    DOCUMENTS: '/uploads/documents',
  },

  // System
  SYSTEM: {
    HEALTH: '/health',
    STATUS: '/status',
    VERSION: '/version',
  },
} as const;

// HTTP methods
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  OPTIONS = 'OPTIONS',
  HEAD = 'HEAD',
}

// HTTP status codes
export enum HttpStatus {
  // Success
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,

  // Redirection
  MOVED_PERMANENTLY = 301,
  FOUND = 302,
  NOT_MODIFIED = 304,

  // Client Error
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,

  // Server Error
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
}

// Request/Response types for common operations
export interface ListRequest {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

export interface ListResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface CreateRequest<T> {
  data: T;
}

export interface CreateResponse<T> {
  data: T;
  message: string;
}

export interface UpdateRequest<T> {
  data: Partial<T>;
}

export interface UpdateResponse<T> {
  data: T;
  message: string;
}

export interface DeleteResponse {
  message: string;
}

export interface BulkRequest<T> {
  action: string;
  items: T[];
  data?: any;
}

export interface BulkResponse {
  success: number;
  failed: number;
  errors?: Array<{
    item: any;
    error: string;
  }>;
  message: string;
}

// File upload types
export interface FileUploadRequest {
  file: File;
  folder?: string;
  public?: boolean;
}

export interface FileUploadResponse {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  publicUrl?: string;
  folder?: string;
  createdAt: string;
}

// Search and filter types
export interface SearchRequest {
  query: string;
  filters?: Record<string, any>;
  facets?: string[];
  page?: number;
  limit?: number;
}

export interface SearchResponse<T> {
  data: T[];
  facets?: Record<string, Array<{
    value: string;
    count: number;
  }>>;
  meta: {
    query: string;
    total: number;
    page: number;
    limit: number;
    took: number; // search time in ms
  };
}

// Analytics types
export interface AnalyticsRequest {
  startDate: string;
  endDate: string;
  granularity?: 'hour' | 'day' | 'week' | 'month';
  metrics?: string[];
  dimensions?: string[];
  filters?: Record<string, any>;
}

export interface AnalyticsResponse {
  data: Array<{
    date: string;
    metrics: Record<string, number>;
    dimensions?: Record<string, string>;
  }>;
  summary: Record<string, number>;
  meta: {
    startDate: string;
    endDate: string;
    granularity: string;
    total: number;
  };
}

// Export/Import types
export interface ExportRequest {
  format: 'csv' | 'xlsx' | 'json';
  filters?: Record<string, any>;
  fields?: string[];
}

export interface ExportResponse {
  downloadUrl: string;
  filename: string;
  size: number;
  expiresAt: string;
}

export interface ImportRequest {
  file: File;
  mapping?: Record<string, string>;
  options?: {
    skipHeader?: boolean;
    delimiter?: string;
    encoding?: string;
  };
}

export interface ImportResponse {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total?: number;
  processed?: number;
  errors?: Array<{
    row: number;
    field?: string;
    message: string;
  }>;
}

// Webhook types
export interface WebhookEvent {
  id: string;
  type: string;
  data: any;
  timestamp: string;
  signature: string;
}

// Rate limiting
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

// API client configuration
export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
  auth?: {
    type: 'bearer' | 'basic' | 'api-key';
    token?: string;
    username?: string;
    password?: string;
    apiKey?: string;
  };
}

// Request interceptor types
export interface RequestInterceptor {
  onRequest?: (config: any) => any;
  onRequestError?: (error: any) => any;
}

export interface ResponseInterceptor {
  onResponse?: (response: any) => any;
  onResponseError?: (error: any) => any;
}

// Cache configuration
export interface CacheConfig {
  enabled: boolean;
  ttl?: number; // time to live in seconds
  key?: string;
  tags?: string[];
}

// Request options
export interface RequestOptions {
  cache?: CacheConfig;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  signal?: AbortSignal;
}
