// Types globaux pour l'application Compozit Vision
export interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string | null;
  preferences?: Record<string, any>;
  nbToken: number;
  currentPlan: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  status: 'draft' | 'processing' | 'completed' | 'archived';
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Design {
  id: string;
  projectId: string;
  originalImageUrl: string;
  enhancedImageUrl?: string;
  style: string;
  roomType?: string;
  dimensions?: Record<string, any>;
  aiMetadata?: Record<string, any>;
  status: 'processing' | 'completed' | 'failed';
  createdAt: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  brand?: string;
  price: number;
  currency: string;
  imageUrl?: string;
  dimensions?: Record<string, any>;
  availability: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface NavigationProps {
  navigation: any;
  route: any;
}
