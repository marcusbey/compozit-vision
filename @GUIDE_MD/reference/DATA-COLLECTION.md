Data Collection Report: Compozit Vision AI Processing Pipeline

  Based on my analysis of the codebase, here's a comprehensive breakdown of what information is
  collected at each step and what gets sent to the AI model:

  📊 Data Collection Flow Overview

  Step 1: Photo Capture & Upload

  Data Collected:
  - Original photo URI/file
  - Image metadata (timestamp, device info, file size)
  - User's current project context
  - Device camera permissions

  Stored Locally:
  - Temporary image file
  - Upload progress state
  - Processing queue information

  ---
  Step 2: Space Analysis (Initial AI Processing)

  Data Sent to AI Model (Gemini Vision):
  // From geminiVisionService.ts
  {
    imageUri: string,
    analysisTypes: ['room_type', 'objects', 'style', 'dimensions'],
    enhancedMode: true,
    temperature: 0.1, // Low temperature for consistent analysis
    maxTokens: 1500
  }

  AI Response Data Collected:
  {
    style_tags: string[],           // e.g., ['modern', 'minimalist']
    mood_tags: string[],            // e.g., ['cozy', 'elegant']
    detected_objects: string[],     // e.g., ['sofa', 'coffee_table']
    space_type: string[],           // e.g., ['living_room']
    color_analysis: {
      dominant_colors: string[],    // Hex color codes
      color_temperature: 'warm'|'cool'|'neutral',
      brightness: 'dark'|'medium'|'light'
    },
    confidence_score: number,       // 0-1 confidence rating
    description: string,            // AI-generated description
    design_suggestions: string[]   // Initial recommendations
  }

  ---
  Step 3: Style Selection

  User Input Collected:
  - Selected style preferences (multi-select)
  - Style influence weights (0-1 scale)
  - Compatibility preferences

  Data Stored:
  {
    selectedStyles: string[],       // User's style choices
    styleInfluences: {
      primary: string,
      secondary: string[],
      compatibility: string[]
    }
  }

  ---
  Step 4: Ambiance Selection

  User Input Collected:
  - Chosen ambiance type
  - Mood preferences
  - Energy level preferences

  Data Structure:
  {
    selectedAmbiance: string,       // e.g., 'cozy', 'sophisticated'
    atmosphere: string,             // Overall feeling
    energy_level: 'calm'|'moderate'|'energetic',
    sophistication: 'casual'|'refined'|'luxury'
  }

  ---
  Step 5: Furniture Selection

  User Interaction Data:
  - Furniture category preferences
  - Individual furniture style selections
  - Skip/accept decisions per category
  - Swipe gesture data (for analytics)

  Data Collected:
  {
    selectedFurniture: {
      [category: string]: FurnitureStyle[]
    },
    furniturePreferences: {
      condition: 'excellent'|'good'|'fair'|'poor',
      style_hint: string,
      confidence: number
    }
  }

  ---
  Step 6: Custom Prompt (Optional)

  User Input:
  - Free-text custom requirements
  - Specific preferences or constraints
  - Budget considerations
  - Special requests

  Context Data Added:
  {
    customPrompt: string,
    context: {
      roomType: string,
      spaceCharacteristics: object,
      detectedObjects: string[],
      userPreferences: object
    }
  }

  ---
  Step 7: Reference Images & Color Palettes (Enhanced Processing)

  User-Uploaded Content:
  // From contentStore.ts and referenceImageService.ts
  {
    referenceInfluences: [{
      referenceId: string,
      imageUrl: string,
      styleInfluence: number,      // 0-1 weight
      colorInfluence: number,      // 0-1 weight
      moodInfluence: number,       // 0-1 weight
      analysisResult: ImageAnalysisResult
    }],
    colorPaletteInfluences: [{
      paletteId: string,
      colors: string[],            // Extracted hex colors
      influence: number,           // 0-1 weight
      paletteType: 'primary'|'secondary'|'accent'
    }]
  }

  ---
  🤖 Final AI Model Request

  Complete Data Package Sent to Enhanced AI Processing:

  // From enhancedAIProcessingService.ts
  const enhancedPrompt = `
  Transform this ${originalAnalysis.space_type.join(', ')} space in ${selectedStyle} style.

  This space will be used as: ${selectedRooms.join(', ')}.

  Original space characteristics: ${originalAnalysis.description}.

  Style influences: ${styleInfluences.map(s => s.styles.join(' and ')).join(', ')}.

  Color palette should include: ${colorInfluences.map(c => c.colors.slice(0,3).join(',
  ')).join(' and ')}.

  Primary color palette: ${primaryPalettes[0].colors.join(', ')}.

  The atmosphere should feel ${topMoods.join(' and ')}.

  Custom requirements: ${customPrompt || 'None specified'}.

  Processing mode: ${processingMode} (conservative/balanced/creative).

  Budget range: ${budgetRange?.min}-${budgetRange?.max}.

  Priority features: ${priorityFeatures?.join(', ')}.

  Create a cohesive, well-designed space that reflects the user's personal style preferences
  while maintaining functionality and visual harmony.
  `;

  // Final AI Generation Request
  {
    originalPhotoUrl: string,
    enhancedPrompt: string,
    qualityLevel: 'draft'|'standard'|'premium',
    spaceAnalysis: ImageAnalysisResult,
    referenceAnalyses: ReferenceInfluence[],
    processingMode: 'conservative'|'balanced'|'creative'
  }

  ---
  💾 Data Storage & Privacy

  Local Storage (AsyncStorage):

  - User projects and progress
  - Uploaded reference images (temporarily)
  - Processing job status
  - User preferences and settings

  Supabase Database:

  // Tables that store user data
  - projects (project metadata, progress)
  - user_reference_images (uploaded references)
  - user_color_palettes (extracted/saved palettes)
  - ai_processing_jobs (job status and results)
  - user_profiles (credits, preferences)

  External AI Services:

  - Google Gemini Vision: Receives original photo + analysis prompts
  - Image Generation Service: Receives enhanced prompts + original photo

  ---
  🔐 Data Security & User Control

  User Consent Points:

  1. Camera/photo library permissions
  2. AI processing agreement (credit consumption)
  3. Reference image upload consent
  4. Data storage acknowledgment

  Data Retention:

  - Processing jobs: Stored until completion + 30 days
  - Reference images: User-controlled deletion
  - AI analysis results: Cached for project duration
  - Generated designs: Permanently stored with project

  Privacy Controls:

  - Users can delete individual reference images
  - Projects can be deleted entirely
  - Color palettes are user-managed
  - Processing can be cancelled mid-flow

  ---
  📈 Analytics & Telemetry

  User Behavior Tracking:
  - Screen navigation patterns
  - Feature usage statistics
  - Processing completion rates
  - Error occurrence frequencies
  - Performance metrics (load times, crash rates)

  No Personal Data in Analytics:
  - Images are never included in telemetry
  - Only anonymized usage patterns
  - Performance metrics without identifying info

  This comprehensive data collection enables highly personalized AI-generated interior design
  recommendations while maintaining user privacy and control over their content.
