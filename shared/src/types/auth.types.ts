export interface User {
  _id: string;
  id: string;
  email: string;
  role: string;
  permissions: string[];
  firstName?: string;
  lastName?: string;
  [key: string]: any;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export interface VendorUser extends User {
  businessName?: string;
  vendorId?: string;
}

export interface JWTPayload {
  _id: string;
  id: string;
  email: string;
  role: string;
  permissions: string[];
  iat?: number;
  exp?: number;
}
