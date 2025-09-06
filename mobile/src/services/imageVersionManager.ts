// Image Version Manager Service
// Tracks image generation history, iterations, and version control for the refinement workflow

import AsyncStorage from '@react-native-async-storage/async-storage';
import { GeneratedImage } from './imageGenerationService';
import { OptimizedPrompt } from './promptOptimizationService';
import contextAnalyticsService from './contextAnalyticsService';

export interface ImageVersion {
  id: string;
  versionNumber: number;
  image: GeneratedImage;
  prompt: OptimizedPrompt;
  parentVersionId?: string;
  refinementType?: 'style_change' | 'material_swap' | 'color_adjustment' | 'detail_enhancement' | 'mood_shift';
  refinementDetails?: string;
  metadata: {
    createdAt: string;
    isBaseline: boolean;
    isFavorite: boolean;
    notes?: string;
    tags?: string[];
  };
}

export interface ImageSession {
  id: string;
  userId?: string;
  originalInput: string;
  baselineVersionId: string;
  currentVersionId: string;
  versions: ImageVersion[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    totalIterations: number;
    context: string;
    features: string[];
  };
}

export interface VersionComparisonResult {
  versionA: ImageVersion;
  versionB: ImageVersion;
  differences: {
    refinementPath: string[];
    promptChanges: string[];
    visualChanges: {
      style?: boolean;
      materials?: boolean;
      colors?: boolean;
      details?: boolean;
      mood?: boolean;
    };
  };
}

class ImageVersionManager {
  private static instance: ImageVersionManager;
  private sessions: Map<string, ImageSession> = new Map();
  private currentSessionId?: string;
  
  private readonly STORAGE_KEY = '@compozit_image_sessions';
  private readonly MAX_SESSIONS = 50; // Maximum sessions to keep in storage
  private readonly MAX_VERSIONS_PER_SESSION = 100; // Maximum versions per session

  private constructor() {
    this.loadSessionsFromStorage();
  }

  public static getInstance(): ImageVersionManager {
    if (!ImageVersionManager.instance) {
      ImageVersionManager.instance = new ImageVersionManager();
    }
    return ImageVersionManager.instance;
  }

  // Create a new image generation session
  public async createSession(
    originalInput: string,
    baselineImage: GeneratedImage,
    baselinePrompt: OptimizedPrompt,
    context?: string,
    features?: string[],
    userId?: string
  ): Promise<ImageSession> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const baselineVersion: ImageVersion = {
      id: `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      versionNumber: 1,
      image: baselineImage,
      prompt: baselinePrompt,
      metadata: {
        createdAt: new Date().toISOString(),
        isBaseline: true,
        isFavorite: false
      }
    };

    const session: ImageSession = {
      id: sessionId,
      userId,
      originalInput,
      baselineVersionId: baselineVersion.id,
      currentVersionId: baselineVersion.id,
      versions: [baselineVersion],
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalIterations: 1,
        context: context || 'unknown',
        features: features || []
      }
    };

    this.sessions.set(sessionId, session);
    this.currentSessionId = sessionId;

    // Track session creation
    contextAnalyticsService.trackEvent('image_session_created', {
      sessionId,
      originalInput,
      context,
      features
    });

    await this.saveSessionsToStorage();
    return session;
  }

  // Add a new version to the current session
  public async addVersion(
    sessionId: string,
    refinedImage: GeneratedImage,
    refinedPrompt: OptimizedPrompt,
    parentVersionId: string,
    refinementType?: ImageVersion['refinementType'],
    refinementDetails?: string
  ): Promise<ImageVersion> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Check version limit
    if (session.versions.length >= this.MAX_VERSIONS_PER_SESSION) {
      throw new Error(`Maximum versions (${this.MAX_VERSIONS_PER_SESSION}) reached for this session`);
    }

    const newVersion: ImageVersion = {
      id: `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      versionNumber: session.versions.length + 1,
      image: refinedImage,
      prompt: refinedPrompt,
      parentVersionId,
      refinementType,
      refinementDetails,
      metadata: {
        createdAt: new Date().toISOString(),
        isBaseline: false,
        isFavorite: false
      }
    };

    session.versions.push(newVersion);
    session.currentVersionId = newVersion.id;
    session.metadata.updatedAt = new Date().toISOString();
    session.metadata.totalIterations = session.versions.length;

    // Track version addition
    contextAnalyticsService.trackEvent('image_version_added', {
      sessionId,
      versionId: newVersion.id,
      versionNumber: newVersion.versionNumber,
      refinementType,
      parentVersionId
    });

    await this.saveSessionsToStorage();
    return newVersion;
  }

  // Get current session
  public getCurrentSession(): ImageSession | null {
    if (!this.currentSessionId) return null;
    return this.sessions.get(this.currentSessionId) || null;
  }

  // Get specific session
  public getSession(sessionId: string): ImageSession | null {
    return this.sessions.get(sessionId) || null;
  }

  // Get all sessions for a user
  public getUserSessions(userId: string): ImageSession[] {
    return Array.from(this.sessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => new Date(b.metadata.updatedAt).getTime() - new Date(a.metadata.updatedAt).getTime());
  }

  // Get specific version
  public getVersion(sessionId: string, versionId: string): ImageVersion | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    return session.versions.find(v => v.id === versionId) || null;
  }

  // Get version history (lineage) for a specific version
  public getVersionLineage(sessionId: string, versionId: string): ImageVersion[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    const lineage: ImageVersion[] = [];
    let currentVersion = session.versions.find(v => v.id === versionId);

    while (currentVersion) {
      lineage.unshift(currentVersion);
      if (!currentVersion.parentVersionId) break;
      currentVersion = session.versions.find(v => v.id === currentVersion!.parentVersionId);
    }

    return lineage;
  }

  // Get all branches from a specific version
  public getVersionBranches(sessionId: string, versionId: string): ImageVersion[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    return session.versions.filter(v => v.parentVersionId === versionId);
  }

  // Compare two versions
  public compareVersions(sessionId: string, versionAId: string, versionBId: string): VersionComparisonResult | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const versionA = session.versions.find(v => v.id === versionAId);
    const versionB = session.versions.find(v => v.id === versionBId);

    if (!versionA || !versionB) return null;

    // Get refinement paths
    const pathA = this.getVersionLineage(sessionId, versionAId).map(v => v.refinementType).filter(Boolean);
    const pathB = this.getVersionLineage(sessionId, versionBId).map(v => v.refinementType).filter(Boolean);

    // Analyze prompt changes
    const promptChanges: string[] = [];
    if (versionA.prompt.optimizedPrompt !== versionB.prompt.optimizedPrompt) {
      promptChanges.push('Prompt content changed');
    }
    if (versionA.prompt.technicalParameters.style !== versionB.prompt.technicalParameters.style) {
      promptChanges.push(`Style: ${versionA.prompt.technicalParameters.style} → ${versionB.prompt.technicalParameters.style}`);
    }

    // Determine visual changes based on refinement history
    const visualChanges = {
      style: pathB.includes('style_change') && !pathA.includes('style_change'),
      materials: pathB.includes('material_swap') && !pathA.includes('material_swap'),
      colors: pathB.includes('color_adjustment') && !pathA.includes('color_adjustment'),
      details: pathB.includes('detail_enhancement') && !pathA.includes('detail_enhancement'),
      mood: pathB.includes('mood_shift') && !pathA.includes('mood_shift')
    };

    return {
      versionA,
      versionB,
      differences: {
        refinementPath: pathB.filter(p => !pathA.includes(p as any)),
        promptChanges,
        visualChanges
      }
    };
  }

  // Toggle favorite status
  public async toggleFavorite(sessionId: string, versionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const version = session.versions.find(v => v.id === versionId);
    if (version) {
      version.metadata.isFavorite = !version.metadata.isFavorite;
      session.metadata.updatedAt = new Date().toISOString();
      
      contextAnalyticsService.trackEvent('version_favorite_toggled', {
        sessionId,
        versionId,
        isFavorite: version.metadata.isFavorite
      });

      await this.saveSessionsToStorage();
    }
  }

  // Add notes to a version
  public async addVersionNotes(sessionId: string, versionId: string, notes: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const version = session.versions.find(v => v.id === versionId);
    if (version) {
      version.metadata.notes = notes;
      session.metadata.updatedAt = new Date().toISOString();
      
      await this.saveSessionsToStorage();
    }
  }

  // Add tags to a version
  public async addVersionTags(sessionId: string, versionId: string, tags: string[]): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const version = session.versions.find(v => v.id === versionId);
    if (version) {
      version.metadata.tags = [...new Set([...(version.metadata.tags || []), ...tags])];
      session.metadata.updatedAt = new Date().toISOString();
      
      await this.saveSessionsToStorage();
    }
  }

  // Reset to a specific version (makes it current)
  public async resetToVersion(sessionId: string, versionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const version = session.versions.find(v => v.id === versionId);
    if (version) {
      session.currentVersionId = versionId;
      session.metadata.updatedAt = new Date().toISOString();
      
      contextAnalyticsService.trackEvent('version_reset', {
        sessionId,
        versionId,
        versionNumber: version.versionNumber
      });

      await this.saveSessionsToStorage();
    }
  }

  // Delete a session
  public async deleteSession(sessionId: string): Promise<void> {
    if (this.sessions.delete(sessionId)) {
      if (this.currentSessionId === sessionId) {
        this.currentSessionId = undefined;
      }
      
      contextAnalyticsService.trackEvent('session_deleted', {
        sessionId
      });

      await this.saveSessionsToStorage();
    }
  }

  // Get session statistics
  public getSessionStats(sessionId: string): any {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const refinementCounts = session.versions.reduce((acc, v) => {
      if (v.refinementType) {
        acc[v.refinementType] = (acc[v.refinementType] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const favoriteCount = session.versions.filter(v => v.metadata.isFavorite).length;
    const averageGenerationTime = session.versions.reduce((sum, v) => sum + (v.image.metadata.generationTime || 0), 0) / session.versions.length;

    return {
      totalVersions: session.versions.length,
      refinementCounts,
      favoriteCount,
      averageGenerationTime,
      sessionDuration: new Date(session.metadata.updatedAt).getTime() - new Date(session.metadata.createdAt).getTime(),
      context: session.metadata.context,
      features: session.metadata.features
    };
  }

  // Export session data
  public exportSession(sessionId: string): string | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    return JSON.stringify(session, null, 2);
  }

  // Storage methods
  private async loadSessionsFromStorage(): Promise<void> {
    try {
      const storedData = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        this.sessions = new Map(Object.entries(parsedData.sessions || {}));
        this.currentSessionId = parsedData.currentSessionId;
      }
    } catch (error) {
      console.error('Failed to load image sessions from storage:', error);
    }
  }

  private async saveSessionsToStorage(): Promise<void> {
    try {
      // Convert Map to object for storage
      const sessionsObject: Record<string, ImageSession> = {};
      
      // Keep only the most recent sessions
      const sortedSessions = Array.from(this.sessions.entries())
        .sort((a, b) => new Date(b[1].metadata.updatedAt).getTime() - new Date(a[1].metadata.updatedAt).getTime())
        .slice(0, this.MAX_SESSIONS);

      sortedSessions.forEach(([id, session]) => {
        sessionsObject[id] = session;
      });

      // Update the sessions Map to reflect the pruned data
      this.sessions = new Map(sortedSessions);

      const dataToStore = {
        sessions: sessionsObject,
        currentSessionId: this.currentSessionId
      };

      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataToStore));
    } catch (error) {
      console.error('Failed to save image sessions to storage:', error);
    }
  }

  // Clear all sessions
  public async clearAllSessions(): Promise<void> {
    this.sessions.clear();
    this.currentSessionId = undefined;
    await AsyncStorage.removeItem(this.STORAGE_KEY);
    
    contextAnalyticsService.trackEvent('all_sessions_cleared', {
      timestamp: new Date().toISOString()
    });
  }

  // Get memory usage estimate
  public getMemoryUsage(): { sessionCount: number; totalVersions: number; estimatedSizeMB: number } {
    let totalVersions = 0;
    this.sessions.forEach(session => {
      totalVersions += session.versions.length;
    });

    // Rough estimate: ~100KB per version (including image URLs and metadata)
    const estimatedSizeMB = (totalVersions * 100) / 1024;

    return {
      sessionCount: this.sessions.size,
      totalVersions,
      estimatedSizeMB
    };
  }
}

// Export singleton instance
export const imageVersionManager = ImageVersionManager.getInstance();
export default imageVersionManager;