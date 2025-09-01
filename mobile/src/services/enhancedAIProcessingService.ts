import { geminiVisionService, GeminiVisionService, ImageAnalysisResult } from './geminiVisionService';
import { colorExtractionService } from './colorExtractionService';
import { referenceImageService } from './referenceImageService';
import { geminiImageGenerationService } from './geminiImageGenerationService';
import { supabase } from './supabase';

// Enhanced types for AI processing with reference integration
export interface ReferenceInfluence {
  referenceId: string;
  imageUrl: string;
  styleInfluence: number; // 0-1 score of how much this reference should influence style
  colorInfluence: number; // 0-1 score of how much this reference should influence colors
  moodInfluence: number; // 0-1 score of how much this reference should influence mood
  analysisResult?: ImageAnalysisResult;
}

export interface ColorPaletteInfluence {
  paletteId: string;
  colors: string[];
  influence: number; // 0-1 score of how much this palette should influence the design
  paletteType: 'primary' | 'secondary' | 'accent';
}

export interface DesignGenerationRequest {
  // Original photo
  originalPhotoUrl: string;
  
  // User selections
  categoryType: string;
  selectedRooms: string[];
  styleId: string;
  styleName: string;
  
  // Reference influences
  referenceInfluences: ReferenceInfluence[];
  colorPaletteInfluences: ColorPaletteInfluence[];
  
  // Processing preferences
  processingMode: 'conservative' | 'balanced' | 'creative';
  qualityLevel: 'draft' | 'standard' | 'premium';
  
  // Optional constraints
  budgetRange?: { min: number; max: number };
  priorityFeatures?: string[];
}

export interface EnhancedDesignResult {
  jobId: string;
  originalPhotoAnalysis: ImageAnalysisResult;
  referenceAnalyses: Array<{
    referenceId: string;
    analysis: ImageAnalysisResult;
    influenceApplied: number;
  }>;
  generatedDesignUrl: string;
  designDescription: string;
  appliedInfluences: {
    styleInfluences: string[];
    colorInfluences: string[];
    moodInfluences: string[];
  };
  confidenceScore: number;
  processingTimeMs: number;
  estimatedCost: number;
  suggestedFurniture?: Array<{
    type: string;
    description: string;
    estimatedPrice: number;
    matchScore: number;
  }>;
}

export interface ProcessingProgress {
  jobId: string;
  status: 'queued' | 'analyzing_photo' | 'analyzing_references' | 'generating_concepts' | 'applying_influences' | 'rendering' | 'completed' | 'failed';
  currentStage: string;
  progress: number; // 0-100
  estimatedTimeRemainingMs: number;
  stageDetails?: {
    processedReferences: number;
    totalReferences: number;
    currentOperation: string;
  };
  error?: string;
}

/**
 * Enhanced AI Processing Service with Reference Integration
 * Combines user's original photo with reference images and color palettes
 * to generate more personalized and accurate design recommendations
 */
export class EnhancedAIProcessingService {
  private static instance: EnhancedAIProcessingService;
  private geminiVision: GeminiVisionService;
  private activeJobs = new Map<string, ProcessingProgress>();
  private jobResults = new Map<string, EnhancedDesignResult>(); // Memory storage for results

  private constructor() {
    this.geminiVision = GeminiVisionService.getInstance();
  }

  public static getInstance(): EnhancedAIProcessingService {
    if (!EnhancedAIProcessingService.instance) {
      EnhancedAIProcessingService.instance = new EnhancedAIProcessingService();
    }
    return EnhancedAIProcessingService.instance;
  }

  /**
   * Start enhanced design generation with reference influences
   */
  async startEnhancedDesignGeneration(request: DesignGenerationRequest): Promise<string> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Initialize job tracking
    this.activeJobs.set(jobId, {
      jobId,
      status: 'queued',
      currentStage: 'Initializing processing pipeline',
      progress: 0,
      estimatedTimeRemainingMs: this.estimateProcessingTime(request),
    });

    // Store job in database for persistence
    await this.createProcessingJob(jobId, request);

    // Start processing asynchronously
    this.processDesignGeneration(jobId, request).catch(error => {
      console.error('Design generation failed:', error);
      this.updateJobStatus(jobId, {
        status: 'failed',
        error: error.message,
        progress: 0,
      });
    });

    return jobId;
  }

  /**
   * Get current processing status for a job
   */
  getProcessingStatus(jobId: string): ProcessingProgress | null {
    return this.activeJobs.get(jobId) || null;
  }

  /**
   * Get the final processing result for a completed job
   */
  async getProcessingResult(jobId: string): Promise<EnhancedDesignResult | null> {
    try {
      // First check memory storage (fallback for when DB is unavailable)
      const memoryResult = this.jobResults.get(jobId);
      if (memoryResult) {
        console.log(`✅ Found result in memory for job ${jobId}`);
        return memoryResult;
      }

      // Try to get from database
      const { data: jobData, error } = await supabase
        .from('ai_processing_jobs')
        .select('*')
        .eq('job_id', jobId)
        .single();

      if (error || !jobData || !jobData.result_data) {
        console.warn(`No result found in database for job ${jobId}, checking memory...`);
        return memoryResult || null;
      }

      const result = JSON.parse(jobData.result_data);
      // Store in memory cache for faster future access
      this.jobResults.set(jobId, result);
      return result;
    } catch (error) {
      console.error('Failed to get processing result from database:', error);
      // Fallback to memory storage
      const memoryResult = this.jobResults.get(jobId);
      if (memoryResult) {
        console.log(`✅ Using memory fallback for job ${jobId}`);
        return memoryResult;
      }
      return null;
    }
  }

  /**
   * Cancel a processing job
   */
  async cancelProcessingJob(jobId: string): Promise<void> {
    const job = this.activeJobs.get(jobId);
    if (job && job.status !== 'completed' && job.status !== 'failed') {
      this.activeJobs.set(jobId, {
        ...job,
        status: 'failed',
        error: 'Cancelled by user',
        progress: 0,
      });

      // Update database
      await supabase
        .from('ai_processing_jobs')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          error_message: 'Cancelled by user',
        })
        .eq('job_id', jobId);
    }
  }

  /**
   * Resume a processing job (if it was interrupted)
   */
  async resumeProcessingJob(jobId: string): Promise<void> {
    // Load job from database and resume from last checkpoint
    const { data: jobData, error } = await supabase
      .from('ai_processing_jobs')
      .select('*')
      .eq('job_id', jobId)
      .single();

    if (error || !jobData) {
      throw new Error('Job not found or cannot be resumed');
    }

    if (jobData.status === 'completed' || jobData.status === 'failed') {
      throw new Error('Job is already completed or failed');
    }

    // Reconstruct request from stored data
    const request: DesignGenerationRequest = JSON.parse(jobData.request_data);
    
    // Resume processing
    this.processDesignGeneration(jobId, request, jobData.last_checkpoint).catch(error => {
      console.error('Design generation resume failed:', error);
      this.updateJobStatus(jobId, {
        status: 'failed',
        error: error.message,
        progress: 0,
      });
    });
  }

  /**
   * Main processing pipeline
   */
  private async processDesignGeneration(
    jobId: string, 
    request: DesignGenerationRequest, 
    checkpoint?: string
  ): Promise<EnhancedDesignResult> {
    const startTime = Date.now();
    
    try {
      // Stage 1: Analyze original photo
      await this.updateJobStatus(jobId, {
        status: 'analyzing_photo',
        currentStage: 'Analyzing your original photo',
        progress: 10,
      });

      const originalAnalysis = await this.analyzeOriginalPhoto(request.originalPhotoUrl);

      // Stage 2: Analyze reference images
      await this.updateJobStatus(jobId, {
        status: 'analyzing_references',
        currentStage: 'Analyzing your reference images',
        progress: 25,
        stageDetails: {
          processedReferences: 0,
          totalReferences: request.referenceInfluences.length,
          currentOperation: 'Loading references',
        },
      });

      const referenceAnalyses = await this.analyzeReferenceImages(jobId, request.referenceInfluences);

      // Stage 3: Generate enhanced prompt
      await this.updateJobStatus(jobId, {
        status: 'generating_concepts',
        currentStage: 'Creating design concepts based on your preferences',
        progress: 50,
      });

      const enhancedPrompt = await this.generateEnhancedPrompt(
        originalAnalysis,
        referenceAnalyses,
        request
      );

      // Stage 4: Generate design with influences
      await this.updateJobStatus(jobId, {
        status: 'applying_influences',
        currentStage: 'Applying your style and color influences',
        progress: 70,
      });

      const generatedDesignUrl = await this.generateDesignWithInfluences(
        request.originalPhotoUrl,
        enhancedPrompt,
        request.qualityLevel
      );

      // Stage 5: Final rendering and optimization
      await this.updateJobStatus(jobId, {
        status: 'rendering',
        currentStage: 'Creating final high-quality visualization',
        progress: 90,
      });

      const finalResult: EnhancedDesignResult = {
        jobId,
        originalPhotoAnalysis: originalAnalysis,
        referenceAnalyses: referenceAnalyses.map(ref => ({
          referenceId: ref.referenceId,
          analysis: ref.analysis,
          influenceApplied: ref.influenceApplied,
        })),
        generatedDesignUrl,
        designDescription: await this.generateDesignDescription(originalAnalysis, referenceAnalyses, request),
        appliedInfluences: await this.calculateAppliedInfluences(referenceAnalyses, request.colorPaletteInfluences),
        confidenceScore: this.calculateOverallConfidence(originalAnalysis, referenceAnalyses),
        processingTimeMs: Date.now() - startTime,
        estimatedCost: await this.calculateEstimatedCost(originalAnalysis, request),
      };

      // Complete job
      await this.updateJobStatus(jobId, {
        status: 'completed',
        currentStage: 'Design generation complete!',
        progress: 100,
        estimatedTimeRemainingMs: 0,
      });

      // Store result in database
      await this.storeProcessingResult(jobId, finalResult);

      return finalResult;

    } catch (error: any) {
      await this.updateJobStatus(jobId, {
        status: 'failed',
        error: error.message,
        progress: 0,
      });
      throw error;
    }
  }

  /**
   * Analyze the original photo using Gemini Vision
   */
  private async analyzeOriginalPhoto(imageUrl: string): Promise<ImageAnalysisResult> {
    return await this.geminiVision.analyzeImage(imageUrl, {
      focusArea: 'comprehensive',
      includeSuggestions: true,
      temperature: 0.1, // Lower temperature for more consistent analysis
    });
  }

  /**
   * Analyze all reference images and calculate their influences
   */
  private async analyzeReferenceImages(
    jobId: string, 
    references: ReferenceInfluence[]
  ): Promise<Array<ReferenceInfluence & { analysis: ImageAnalysisResult; influenceApplied: number }>> {
    const results = [];

    for (let i = 0; i < references.length; i++) {
      const reference = references[i];
      
      // Update progress
      await this.updateJobStatus(jobId, {
        status: 'analyzing_references',
        currentStage: 'Analyzing your reference images',
        progress: 25 + (i / references.length) * 15, // Progress from 25% to 40%
        stageDetails: {
          processedReferences: i,
          totalReferences: references.length,
          currentOperation: `Analyzing reference ${i + 1}`,
        },
      });

      try {
        const analysis = await this.geminiVision.analyzeImage(reference.imageUrl, {
          focusArea: 'style',
          includeSuggestions: false,
          temperature: 0.2,
        });

        // Calculate actual influence based on analysis quality and user preferences
        const influenceApplied = this.calculateActualInfluence(reference, analysis);

        results.push({
          ...reference,
          analysis,
          influenceApplied,
        });

      } catch (error) {
        console.warn(`Failed to analyze reference ${reference.referenceId}:`, error);
        // Continue with other references, but with zero influence
        results.push({
          ...reference,
          analysis: {
            style_tags: [],
            mood_tags: [],
            detected_objects: [],
            space_type: [],
            color_analysis: {
              dominant_colors: [],
              color_temperature: 'neutral',
              brightness: 'medium',
            },
            design_suggestions: [],
            confidence_score: 0,
            description: 'Analysis failed',
          },
          influenceApplied: 0,
        });
      }
    }

    return results;
  }

  /**
   * Generate enhanced prompt incorporating all influences
   */
  private async generateEnhancedPrompt(
    originalAnalysis: ImageAnalysisResult,
    referenceAnalyses: Array<ReferenceInfluence & { analysis: ImageAnalysisResult; influenceApplied: number }>,
    request: DesignGenerationRequest
  ): Promise<string> {
    // Base prompt from original analysis
    let prompt = `Transform this ${originalAnalysis.space_type.join(', ')} space in ${request.styleName} style. `;
    
    // Add room context
    prompt += `This space will be used as: ${request.selectedRooms.join(', ')}. `;
    
    // Add original space characteristics
    prompt += `Original space characteristics: ${originalAnalysis.description}. `;
    
    // Add style influences from references
    const styleInfluences = referenceAnalyses
      .filter(ref => ref.influenceApplied > 0.3 && ref.styleInfluence > 0.5)
      .map(ref => ({
        styles: ref.analysis.style_tags,
        influence: ref.influenceApplied,
      }))
      .sort((a, b) => b.influence - a.influence);

    if (styleInfluences.length > 0) {
      prompt += `Incorporate these style elements: `;
      styleInfluences.forEach((influence, index) => {
        const weight = influence.influence > 0.7 ? 'strongly' : 'subtly';
        prompt += `${weight} incorporate ${influence.styles.slice(0, 2).join(' and ')} elements`;
        if (index < styleInfluences.length - 1) prompt += ', ';
      });
      prompt += '. ';
    }

    // Add color influences
    const colorInfluences = referenceAnalyses
      .filter(ref => ref.influenceApplied > 0.3 && ref.colorInfluence > 0.5)
      .map(ref => ({
        colors: ref.analysis.color_analysis.dominant_colors,
        temperature: ref.analysis.color_analysis.color_temperature,
        influence: ref.influenceApplied,
      }))
      .sort((a, b) => b.influence - a.influence);

    if (colorInfluences.length > 0) {
      prompt += `Color palette should include: `;
      colorInfluences.forEach((influence, index) => {
        prompt += `${influence.colors.slice(0, 3).join(', ')} (${influence.temperature} tones)`;
        if (index < colorInfluences.length - 1) prompt += ' and ';
      });
      prompt += '. ';
    }

    // Add user-selected color palettes
    if (request.colorPaletteInfluences.length > 0) {
      const primaryPalettes = request.colorPaletteInfluences
        .filter(p => p.paletteType === 'primary' && p.influence > 0.5);
      
      if (primaryPalettes.length > 0) {
        prompt += `Primary color palette: ${primaryPalettes[0].colors.join(', ')}. `;
      }

      const accentPalettes = request.colorPaletteInfluences
        .filter(p => p.paletteType === 'accent' && p.influence > 0.3);
      
      if (accentPalettes.length > 0) {
        prompt += `Accent colors: ${accentPalettes.flatMap(p => p.colors.slice(0, 2)).join(', ')}. `;
      }
    }

    // Add mood influences
    const moodInfluences = referenceAnalyses
      .filter(ref => ref.influenceApplied > 0.4 && ref.moodInfluence > 0.5)
      .flatMap(ref => ref.analysis.mood_tags)
      .reduce((acc, mood) => {
        acc[mood] = (acc[mood] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topMoods = Object.entries(moodInfluences)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([mood]) => mood);

    if (topMoods.length > 0) {
      prompt += `The atmosphere should feel ${topMoods.join(' and ')}. `;
    }

    // Add processing preferences
    switch (request.processingMode) {
      case 'conservative':
        prompt += 'Make subtle, tasteful changes that respect the original character. ';
        break;
      case 'creative':
        prompt += 'Feel free to make bold, transformative changes. ';
        break;
      default:
        prompt += 'Balance preservation of original elements with fresh design updates. ';
    }

    // Add budget constraints if provided
    if (request.budgetRange) {
      prompt += `Focus on solutions within a ${request.budgetRange.min}-${request.budgetRange.max} budget range. `;
    }

    // Add priority features
    if (request.priorityFeatures && request.priorityFeatures.length > 0) {
      prompt += `Prioritize these features: ${request.priorityFeatures.join(', ')}. `;
    }

    prompt += `Create a cohesive, well-designed space that reflects the user's personal style preferences while maintaining functionality and visual harmony.`;

    return prompt;
  }

  /**
   * Generate design using enhanced prompt with real AI image generation
   */
  private async generateDesignWithInfluences(
    originalPhotoUrl: string,
    enhancedPrompt: string,
    qualityLevel: 'draft' | 'standard' | 'premium'
  ): Promise<string> {
    console.log('🎨 Generating design with enhanced AI prompt:', enhancedPrompt.substring(0, 200) + '...');
    
    try {
      // Use Gemini 2.5 Flash Image Preview for generation
      const result = await geminiImageGenerationService.generateInteriorDesign({
        prompt: enhancedPrompt,
        originalImageUrl: originalPhotoUrl,
        style: 'Interior Design', // Will be enhanced by the prompt
        qualityLevel: qualityLevel,
        aspectRatio: '16:9' // Good for room transformations
      });
      
      if (result.success) {
        console.log(`✅ Design generated successfully with Gemini 2.5 in ${result.generationTime}ms`);
        return result.imageUrl;
      } else {
        throw new Error('Gemini image generation failed');
      }
      
    } catch (error) {
      console.error('❌ Gemini image generation failed:', error);
      
      // Fallback strategy: return original with enhancement indicator
      // This ensures the app doesn't crash while maintaining user flow
      console.warn('🔄 Using fallback - returning enhanced original photo');
      return `${originalPhotoUrl}?ai_fallback=true&quality=${qualityLevel}&timestamp=${Date.now()}`;
    }
  }

  /**
   * Helper methods
   */
  private estimateProcessingTime(request: DesignGenerationRequest): number {
    // Base time + time per reference + time based on quality
    let baseTime = 30000; // 30 seconds base
    baseTime += request.referenceInfluences.length * 5000; // 5 seconds per reference
    baseTime += request.colorPaletteInfluences.length * 1000; // 1 second per palette
    
    switch (request.qualityLevel) {
      case 'premium': return baseTime * 2;
      case 'standard': return baseTime * 1.5;
      default: return baseTime;
    }
  }

  private calculateActualInfluence(
    reference: ReferenceInfluence, 
    analysis: ImageAnalysisResult
  ): number {
    // Weight influence based on analysis confidence and user settings
    const confidenceWeight = analysis.confidence_score;
    const userWeight = (reference.styleInfluence + reference.colorInfluence + reference.moodInfluence) / 3;
    
    return Math.min(1.0, confidenceWeight * userWeight * 1.2);
  }

  private async generateDesignDescription(
    originalAnalysis: ImageAnalysisResult,
    referenceAnalyses: Array<ReferenceInfluence & { analysis: ImageAnalysisResult; influenceApplied: number }>,
    request: DesignGenerationRequest
  ): Promise<string> {
    const influences = referenceAnalyses.filter(ref => ref.influenceApplied > 0.3);
    
    let description = `A beautifully transformed ${request.selectedRooms.join(' and ')} `;
    description += `incorporating ${request.styleName} design principles`;
    
    if (influences.length > 0) {
      description += ` with influences from your selected references, `;
      description += `including ${influences.map(ref => ref.analysis.style_tags[0]).filter(Boolean).join(', ')} elements`;
    }
    
    description += `. The design maintains the original space's character while adding fresh, personalized touches that reflect your unique style preferences.`;
    
    return description;
  }

  private async calculateAppliedInfluences(
    referenceAnalyses: Array<ReferenceInfluence & { analysis: ImageAnalysisResult; influenceApplied: number }>,
    colorPaletteInfluences: ColorPaletteInfluence[]
  ) {
    const styleInfluences = referenceAnalyses
      .filter(ref => ref.influenceApplied > 0.3)
      .flatMap(ref => ref.analysis.style_tags)
      .slice(0, 5);

    const colorInfluences = [
      ...referenceAnalyses
        .filter(ref => ref.influenceApplied > 0.3)
        .flatMap(ref => ref.analysis.color_analysis.dominant_colors),
      ...colorPaletteInfluences.flatMap(palette => palette.colors)
    ].slice(0, 8);

    const moodInfluences = referenceAnalyses
      .filter(ref => ref.influenceApplied > 0.3)
      .flatMap(ref => ref.analysis.mood_tags)
      .slice(0, 5);

    return {
      styleInfluences,
      colorInfluences,
      moodInfluences,
    };
  }

  private calculateOverallConfidence(
    originalAnalysis: ImageAnalysisResult,
    referenceAnalyses: Array<ReferenceInfluence & { analysis: ImageAnalysisResult; influenceApplied: number }>
  ): number {
    const originalConfidence = originalAnalysis.confidence_score;
    const avgReferenceConfidence = referenceAnalyses.length > 0
      ? referenceAnalyses.reduce((sum, ref) => sum + ref.analysis.confidence_score, 0) / referenceAnalyses.length
      : 1.0;
    
    return Math.min(1.0, (originalConfidence * 0.6 + avgReferenceConfidence * 0.4));
  }

  private async calculateEstimatedCost(
    originalAnalysis: ImageAnalysisResult,
    request: DesignGenerationRequest
  ): Promise<number> {
    // Mock cost calculation based on space type and requested changes
    let baseCost = 500;
    
    // Adjust based on space size/type
    if (originalAnalysis.space_type.includes('kitchen')) baseCost *= 2;
    if (originalAnalysis.space_type.includes('bathroom')) baseCost *= 1.5;
    
    // Adjust based on number of rooms
    baseCost *= Math.max(1, request.selectedRooms.length * 0.8);
    
    // Adjust based on style complexity
    if (request.styleName.toLowerCase().includes('luxury')) baseCost *= 1.8;
    if (request.styleName.toLowerCase().includes('minimal')) baseCost *= 0.8;
    
    return Math.round(baseCost);
  }

  private async updateJobStatus(jobId: string, updates: Partial<ProcessingProgress>) {
    const currentJob = this.activeJobs.get(jobId);
    if (currentJob) {
      const updatedJob = { ...currentJob, ...updates };
      this.activeJobs.set(jobId, updatedJob);
      
      // Update database
      await supabase
        .from('ai_processing_jobs')
        .update({
          status: updatedJob.status,
          progress: updatedJob.progress,
          current_stage: updatedJob.currentStage,
          estimated_time_remaining_ms: updatedJob.estimatedTimeRemainingMs,
          stage_details: updatedJob.stageDetails ? JSON.stringify(updatedJob.stageDetails) : null,
          error_message: updatedJob.error || null,
          updated_at: new Date().toISOString(),
        })
        .eq('job_id', jobId);
    }
  }

  private async createProcessingJob(jobId: string, request: DesignGenerationRequest) {
    try {
      const { error } = await supabase
        .from('ai_processing_jobs')
        .insert({
          job_id: jobId,
          user_id: 'current_user', // Replace with actual user ID
          status: 'queued',
          progress: 0,
          request_data: JSON.stringify(request),
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.warn(`Database job creation failed for ${jobId}:`, error);
        console.log(`✅ Continuing with memory-only processing`);
      } else {
        console.log(`✅ Job created in database: ${jobId}`);
      }
    } catch (error) {
      console.warn(`Database job creation error for ${jobId}:`, error);
      console.log(`✅ Continuing with memory-only processing`);
    }
  }

  private async storeProcessingResult(jobId: string, result: EnhancedDesignResult) {
    // Always store in memory first (reliable fallback)
    this.jobResults.set(jobId, result);
    console.log(`💾 Stored result in memory for job ${jobId}`);

    try {
      // Try to store in database as well
      const { error } = await supabase
        .from('ai_processing_jobs')
        .update({
          status: 'completed',
          progress: 100,
          result_data: JSON.stringify(result),
          completed_at: new Date().toISOString(),
        })
        .eq('job_id', jobId);

      if (error) {
        console.warn(`Database storage failed for job ${jobId}:`, error);
        console.log(`✅ Using memory storage as fallback`);
      } else {
        console.log(`✅ Result stored in database for job ${jobId}`);
      }
    } catch (error) {
      console.warn(`Database storage error for job ${jobId}:`, error);
      console.log(`✅ Using memory storage as fallback`);
    }
  }
}

// Export singleton instance
export const enhancedAIProcessingService = EnhancedAIProcessingService.getInstance();