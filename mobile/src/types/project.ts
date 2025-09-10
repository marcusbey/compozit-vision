// Enhanced Project Data Models for Professional App

export interface ClientInfo {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  notes?: string;
}

export interface ProjectBudget {
  total: number;
  spent: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD';
  breakdown?: {
    category: string;
    allocated: number;
    spent: number;
  }[];
}

export interface ProjectTimeline {
  created: Date;
  deadline?: Date;
  lastModified: Date;
  completed?: Date;
  milestones?: {
    id: string;
    name: string;
    date: Date;
    completed: boolean;
  }[];
}

export interface ProjectAssets {
  heroImage?: string;
  floorPlans: string[];
  beforePhotos: string[];
  afterPhotos: string[];
  aiGeneratedImages: string[];
  referenceImages: string[];
  moodBoard?: string;
}

export interface ProjectLocation {
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  propertyType?: 'house' | 'apartment' | 'condo' | 'commercial' | 'other';
  squareFootage?: number;
}

export interface ProjectCollaborator {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'designer' | 'contractor' | 'client' | 'viewer';
  permissions: {
    canEdit: boolean;
    canComment: boolean;
    canExport: boolean;
  };
}

export interface ProjectSettings {
  isPublic: boolean;
  allowComments: boolean;
  allowDownloads: boolean;
  watermarkImages: boolean;
  notificationLevel: 'all' | 'important' | 'none';
}

export interface EnhancedProject {
  // Core project data
  id: string;
  name: string;
  description?: string;
  
  // Project status and progress
  status: 'draft' | 'active' | 'review' | 'completed' | 'archived';
  progress: number; // 0-100
  
  // Room and style information
  roomType: string;
  roomSubtype?: string;
  style: string[];
  colorPalette?: string[];
  
  // Client and budget information
  client?: ClientInfo;
  budget?: ProjectBudget;
  
  // Timeline and scheduling
  timeline: ProjectTimeline;
  
  // Project assets and media
  assets: ProjectAssets;
  
  // Location information
  location?: ProjectLocation;
  
  // Collaboration and sharing
  collaborators?: ProjectCollaborator[];
  tags: string[];
  
  // Project settings
  settings: ProjectSettings;
  
  // Professional features
  projectNumber?: string; // For invoicing/tracking
  contractValue?: number;
  estimatedHours?: number;
  actualHours?: number;
  
  // Analytics
  views?: number;
  lastViewed?: Date;
  exportCount?: number;
  
  // Integration data
  supabaseId?: string;
  syncStatus?: 'synced' | 'pending' | 'error';
  lastSynced?: Date;
}

// Project creation/update DTOs
export interface CreateProjectRequest {
  name: string;
  description?: string;
  roomType: string;
  style: string[];
  client?: Partial<ClientInfo>;
  budget?: Partial<ProjectBudget>;
  deadline?: Date;
  location?: Partial<ProjectLocation>;
  tags?: string[];
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  status?: EnhancedProject['status'];
  progress?: number;
  assets?: Partial<ProjectAssets>;
  settings?: Partial<ProjectSettings>;
}

// Project filter and sort options
export interface ProjectFilters {
  status?: EnhancedProject['status'][];
  roomType?: string[];
  style?: string[];
  client?: string[];
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  budgetRange?: {
    min: number;
    max: number;
  };
}

export interface ProjectSortOptions {
  field: 'name' | 'created' | 'lastModified' | 'deadline' | 'progress' | 'budget';
  direction: 'asc' | 'desc';
}

// Project statistics and analytics
export interface ProjectStats {
  total: number;
  byStatus: Record<EnhancedProject['status'], number>;
  byRoomType: Record<string, number>;
  byStyle: Record<string, number>;
  averageProgress: number;
  totalBudget: number;
  totalSpent: number;
  upcomingDeadlines: {
    project: Pick<EnhancedProject, 'id' | 'name' | 'timeline'>;
    daysUntilDeadline: number;
  }[];
}

// Template system for quick project creation
export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: 'residential' | 'commercial' | 'specialty';
  roomType: string;
  defaultStyle: string[];
  estimatedTimeline: number; // days
  estimatedBudget?: number;
  includedFeatures: string[];
  template: Partial<EnhancedProject>;
}

// Export formats and options
export interface ProjectExportOptions {
  format: 'pdf' | 'images' | 'presentation' | 'csv' | 'json';
  includeImages: boolean;
  includeMetadata: boolean;
  includeTimeline: boolean;
  includeBudget: boolean;
  watermark?: boolean;
  resolution?: 'low' | 'medium' | 'high' | 'print';
}

export interface ProjectExportResult {
  id: string;
  format: ProjectExportOptions['format'];
  fileUrl: string;
  fileName: string;
  fileSize: number;
  createdAt: Date;
  expiresAt?: Date;
}

// Type guards and utility types
export type ProjectStatus = EnhancedProject['status'];
export type ProjectRole = ProjectCollaborator['role'];
export type ProjectCurrency = ProjectBudget['currency'];

// Utility type for project cards display
export interface ProjectCardData {
  id: string;
  name: string;
  client?: string;
  status: ProjectStatus;
  progress: number;
  lastModified: Date;
  heroImage?: string;
  roomType: string;
  budget?: number;
  deadline?: Date;
  tags: string[];
}

// Helper functions types
export interface ProjectHelpers {
  formatProgress: (progress: number) => string;
  formatBudget: (budget: ProjectBudget) => string;
  formatDeadline: (deadline: Date) => string;
  getStatusColor: (status: ProjectStatus) => string;
  getRoomTypeIcon: (roomType: string) => string;
  calculateProjectHealth: (project: EnhancedProject) => 'good' | 'warning' | 'critical';
}