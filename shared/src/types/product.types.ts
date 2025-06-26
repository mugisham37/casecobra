import { z } from 'zod';
import { BaseEntity, FileUpload } from './common.types';

// Product schemas
export const CreateProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Product description is required'),
  shortDescription: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  price: z.number().min(0, 'Price must be positive'),
  comparePrice: z.number().min(0, 'Compare price must be positive').optional(),
  costPrice: z.number().min(0, 'Cost price must be positive').optional(),
  categoryId: z.string().min(1, 'Category is required'),
  brandId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  weight: z.number().min(0, 'Weight must be positive').optional(),
  dimensions: z.object({
    length: z.number().min(0),
    width: z.number().min(0),
    height: z.number().min(0),
  }).optional(),
  inventory: z.object({
    trackQuantity: z.boolean(),
    quantity: z.number().min(0, 'Quantity must be positive'),
    lowStockThreshold: z.number().min(0, 'Low stock threshold must be positive').optional(),
    allowBackorder: z.boolean().optional(),
  }),
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).optional(),
  }).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isDigital: z.boolean().optional(),
  requiresShipping: z.boolean().optional(),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export const ProductSearchSchema = z.object({
  query: z.string().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  inStock: z.boolean().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

// Type definitions
export type CreateProductRequest = z.infer<typeof CreateProductSchema>;
export type UpdateProductRequest = z.infer<typeof UpdateProductSchema>;
export type ProductSearchParams = z.infer<typeof ProductSearchSchema>;

// Product interfaces
export interface Product extends BaseEntity {
  name: string;
  description: string;
  shortDescription?: string;
  slug: string;
  sku: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  categoryId: string;
  category: ProductCategory;
  brandId?: string;
  brand?: ProductBrand;
  tags: string[];
  images: ProductImage[];
  variants: ProductVariant[];
  attributes: ProductAttribute[];
  inventory: ProductInventory;
  seo: ProductSEO;
  weight?: number;
  dimensions?: ProductDimensions;
  isActive: boolean;
  isFeatured: boolean;
  isDigital: boolean;
  requiresShipping: boolean;
  rating: ProductRating;
  salesCount: number;
  viewCount: number;
  createdBy: string;
  updatedBy: string;
}

export interface ProductImage extends BaseEntity {
  productId: string;
  file: FileUpload;
  alt: string;
  position: number;
  isMain: boolean;
}

export interface ProductVariant extends BaseEntity {
  productId: string;
  name: string;
  sku: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  inventory: ProductInventory;
  attributes: Record<string, string>; // e.g., { color: 'red', size: 'M' }
  image?: ProductImage;
  isActive: boolean;
}

export interface ProductAttribute {
  name: string;
  value: string;
  type: AttributeType;
  isRequired: boolean;
  isVariant: boolean; // Used for creating variants
}

export interface ProductInventory {
  trackQuantity: boolean;
  quantity: number;
  reserved: number; // Quantity reserved for pending orders
  available: number; // quantity - reserved
  lowStockThreshold?: number;
  allowBackorder: boolean;
  stockStatus: StockStatus;
}

export interface ProductSEO {
  title?: string;
  description?: string;
  keywords: string[];
  slug: string;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'in';
}

export interface ProductRating {
  average: number;
  count: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

// Product category
export interface ProductCategory extends BaseEntity {
  name: string;
  description?: string;
  slug: string;
  parentId?: string;
  parent?: ProductCategory;
  children: ProductCategory[];
  image?: FileUpload;
  isActive: boolean;
  sortOrder: number;
  seo: ProductSEO;
  productCount: number;
}

export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  parentId: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).optional(),
  }).optional(),
});

export type CreateCategoryRequest = z.infer<typeof CreateCategorySchema>;

// Product brand
export interface ProductBrand extends BaseEntity {
  name: string;
  description?: string;
  slug: string;
  logo?: FileUpload;
  website?: string;
  isActive: boolean;
  productCount: number;
}

export const CreateBrandSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  description: z.string().optional(),
  website: z.string().url().optional(),
  isActive: z.boolean().optional(),
});

export type CreateBrandRequest = z.infer<typeof CreateBrandSchema>;

// Enums
export enum StockStatus {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  BACKORDER = 'backorder',
}

export enum AttributeType {
  TEXT = 'text',
  NUMBER = 'number',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  BOOLEAN = 'boolean',
  DATE = 'date',
  COLOR = 'color',
  IMAGE = 'image',
}

export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

// Product reviews
export interface ProductReview extends BaseEntity {
  productId: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  rating: number;
  title: string;
  comment: string;
  images: FileUpload[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  helpfulCount: number;
  reportCount: number;
}

export const CreateReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
  title: z.string().min(1, 'Review title is required'),
  comment: z.string().min(1, 'Review comment is required'),
});

export type CreateReviewRequest = z.infer<typeof CreateReviewSchema>;

// Product collections
export interface ProductCollection extends BaseEntity {
  name: string;
  description?: string;
  slug: string;
  image?: FileUpload;
  products: Product[];
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  conditions: CollectionCondition[];
}

export interface CollectionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
}

// Product wishlist
export interface Wishlist extends BaseEntity {
  userId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  products: WishlistItem[];
}

export interface WishlistItem extends BaseEntity {
  wishlistId: string;
  productId: string;
  product: Product;
  variantId?: string;
  variant?: ProductVariant;
  addedAt: Date;
  notes?: string;
}

// Product comparison
export interface ProductComparison {
  products: Product[];
  attributes: string[];
}

// Product analytics
export interface ProductAnalytics {
  productId: string;
  views: number;
  uniqueViews: number;
  addToCart: number;
  purchases: number;
  revenue: number;
  conversionRate: number;
  averageRating: number;
  reviewCount: number;
  period: {
    start: Date;
    end: Date;
  };
}

// Bulk operations
export interface BulkProductOperation {
  action: 'activate' | 'deactivate' | 'delete' | 'update_category' | 'update_price';
  productIds: string[];
  data?: any;
}

// Product export/import
export interface ProductExportData {
  id: string;
  name: string;
  sku: string;
  price: number;
  category: string;
  brand?: string;
  inventory: number;
  status: string;
  createdAt: string;
}

export interface ProductImportData {
  name: string;
  description: string;
  sku: string;
  price: number;
  categoryName: string;
  brandName?: string;
  inventory: number;
  tags?: string;
}
