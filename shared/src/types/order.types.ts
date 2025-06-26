import { z } from 'zod';
import { BaseEntity, Address, AddressSchema } from './common.types';
import { Product, ProductVariant } from './product.types';

// Enums (declared first to avoid forward reference issues)
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  RETURNED = 'returned',
}

export enum PaymentStatus {
  PENDING = 'pending',
  AUTHORIZED = 'authorized',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially_paid',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

export enum FulfillmentStatus {
  UNFULFILLED = 'unfulfilled',
  PARTIALLY_FULFILLED = 'partially_fulfilled',
  FULFILLED = 'fulfilled',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  RETURNED = 'returned',
}

export enum OrderSource {
  WEB = 'web',
  MOBILE = 'mobile',
  ADMIN = 'admin',
  API = 'api',
  MARKETPLACE = 'marketplace',
}

export enum PaymentType {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PAYPAL = 'paypal',
  STRIPE = 'stripe',
  BANK_TRANSFER = 'bank_transfer',
  CASH_ON_DELIVERY = 'cash_on_delivery',
  WALLET = 'wallet',
  CRYPTOCURRENCY = 'cryptocurrency',
}

export enum TransactionType {
  PAYMENT = 'payment',
  REFUND = 'refund',
  PARTIAL_REFUND = 'partial_refund',
  CHARGEBACK = 'chargeback',
  AUTHORIZATION = 'authorization',
  CAPTURE = 'capture',
  VOID = 'void',
}

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum CouponType {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage',
  FREE_SHIPPING = 'free_shipping',
  BUY_X_GET_Y = 'buy_x_get_y',
}

export enum ReturnReason {
  DEFECTIVE = 'defective',
  WRONG_ITEM = 'wrong_item',
  NOT_AS_DESCRIBED = 'not_as_described',
  CHANGED_MIND = 'changed_mind',
  DAMAGED_IN_SHIPPING = 'damaged_in_shipping',
  ARRIVED_LATE = 'arrived_late',
  OTHER = 'other',
}

export enum ReturnStatus {
  REQUESTED = 'requested',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  RECEIVED = 'received',
  PROCESSED = 'processed',
  REFUNDED = 'refunded',
}

export enum NotificationType {
  ORDER_CONFIRMATION = 'order_confirmation',
  PAYMENT_CONFIRMATION = 'payment_confirmation',
  SHIPPING_NOTIFICATION = 'shipping_notification',
  DELIVERY_CONFIRMATION = 'delivery_confirmation',
  ORDER_CANCELLED = 'order_cancelled',
  REFUND_PROCESSED = 'refund_processed',
  RETURN_APPROVED = 'return_approved',
}

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  BOUNCED = 'bounced',
}

// Order schemas
export const CreateOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1, 'Product ID is required'),
    variantId: z.string().optional(),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    price: z.number().min(0, 'Price must be positive'),
  })),
  shippingAddress: AddressSchema,
  billingAddress: AddressSchema.optional(),
  shippingMethodId: z.string().min(1, 'Shipping method is required'),
  paymentMethodId: z.string().min(1, 'Payment method is required'),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
});

export const UpdateOrderSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
});

export const OrderSearchSchema = z.object({
  query: z.string().optional(),
  status: z.nativeEnum(OrderStatus).optional(),
  customerId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  fulfillmentStatus: z.nativeEnum(FulfillmentStatus).optional(),
});

// Type definitions
export type CreateOrderRequest = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderRequest = z.infer<typeof UpdateOrderSchema>;
export type OrderSearchParams = z.infer<typeof OrderSearchSchema>;

// Order interfaces
export interface Order extends BaseEntity {
  orderNumber: string;
  customerId: string;
  customer: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  
  // Addresses
  shippingAddress: Address;
  billingAddress: Address;
  
  // Pricing
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  
  // Shipping
  shippingMethod: ShippingMethod;
  trackingNumber?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  
  // Payment
  paymentMethod: PaymentMethod;
  transactions: PaymentTransaction[];
  
  // Discounts
  coupons: AppliedCoupon[];
  
  // Metadata
  notes?: string;
  internalNotes?: string;
  tags: string[];
  source: OrderSource;
  currency: string;
  
  // Timestamps
  placedAt: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
  refundedAt?: Date;
}

export interface OrderItem extends BaseEntity {
  orderId: string;
  productId: string;
  product: Product;
  variantId?: string;
  variant?: ProductVariant;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxAmount: number;
  discountAmount: number;
  sku: string;
  name: string;
  image?: string;
  attributes?: Record<string, string>;
}


// Shipping
export interface ShippingMethod extends BaseEntity {
  name: string;
  description?: string;
  code: string;
  price: number;
  freeShippingThreshold?: number;
  estimatedDays: {
    min: number;
    max: number;
  };
  isActive: boolean;
  zones: ShippingZone[];
  restrictions: ShippingRestriction[];
}

export interface ShippingZone extends BaseEntity {
  name: string;
  countries: string[];
  states?: string[];
  postalCodes?: string[];
  isActive: boolean;
}

export interface ShippingRestriction {
  type: 'weight' | 'dimensions' | 'value' | 'product_type';
  operator: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  value: number | string;
}

// Payment
export interface PaymentMethod extends BaseEntity {
  name: string;
  type: PaymentType;
  provider: string;
  isActive: boolean;
  settings: Record<string, any>;
  supportedCurrencies: string[];
  fees: PaymentFee[];
}

export interface PaymentFee {
  type: 'fixed' | 'percentage';
  amount: number;
  currency?: string;
}

export interface PaymentTransaction extends BaseEntity {
  orderId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  gatewayTransactionId?: string;
  gatewayResponse?: Record<string, any>;
  failureReason?: string;
  processedAt?: Date;
}

// Coupons and Discounts
export interface Coupon extends BaseEntity {
  code: string;
  name: string;
  description?: string;
  type: CouponType;
  value: number;
  minimumAmount?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  userUsageLimit?: number;
  isActive: boolean;
  startsAt?: Date;
  expiresAt?: Date;
  applicableProducts: string[];
  applicableCategories: string[];
  excludedProducts: string[];
  excludedCategories: string[];
}

export interface AppliedCoupon {
  couponId: string;
  code: string;
  name: string;
  discountAmount: number;
}

// Shopping Cart
export interface Cart extends BaseEntity {
  userId?: string;
  sessionId?: string;
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  appliedCoupons: AppliedCoupon[];
  shippingAddress?: Address;
  billingAddress?: Address;
  shippingMethodId?: string;
  expiresAt: Date;
}

export interface CartItem extends BaseEntity {
  cartId: string;
  productId: string;
  product: Product;
  variantId?: string;
  variant?: ProductVariant;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  addedAt: Date;
}

export const AddToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  variantId: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
});

export const UpdateCartItemSchema = z.object({
  quantity: z.number().min(0, 'Quantity must be positive'),
});

export type AddToCartRequest = z.infer<typeof AddToCartSchema>;
export type UpdateCartItemRequest = z.infer<typeof UpdateCartItemSchema>;

// Order analytics
export interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
  topProducts: {
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
  }[];
  ordersByStatus: Record<OrderStatus, number>;
  revenueByMonth: {
    month: string;
    revenue: number;
    orders: number;
  }[];
  period: {
    start: Date;
    end: Date;
  };
}

// Order fulfillment
export interface Fulfillment extends BaseEntity {
  orderId: string;
  items: FulfillmentItem[];
  trackingNumber?: string;
  trackingUrl?: string;
  carrier?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  notes?: string;
}

export interface FulfillmentItem {
  orderItemId: string;
  quantity: number;
}

// Order returns
export interface OrderReturn extends BaseEntity {
  orderId: string;
  customerId: string;
  items: ReturnItem[];
  reason: ReturnReason;
  status: ReturnStatus;
  refundAmount: number;
  restockingFee?: number;
  notes?: string;
  adminNotes?: string;
  requestedAt: Date;
  approvedAt?: Date;
  processedAt?: Date;
}

export interface ReturnItem {
  orderItemId: string;
  quantity: number;
  reason: string;
  condition: 'new' | 'used' | 'damaged';
}

// Order notifications
export interface OrderNotification extends BaseEntity {
  orderId: string;
  customerId: string;
  type: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;
  content: {
    subject: string;
    body: string;
    data?: Record<string, any>;
  };
  sentAt?: Date;
  deliveredAt?: Date;
  failureReason?: string;
}
