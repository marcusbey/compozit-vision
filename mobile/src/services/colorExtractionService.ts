import ColorThief from 'colorthief';
import { supabase } from './supabase';

// Types
export interface DominantColors {
  primary: string;
  secondary?: string;
  palette: string[];
  harmony: 'complementary' | 'analogous' | 'triadic' | 'monochromatic' | 'split-complementary';
  temperature: 'warm' | 'cool' | 'neutral';
  brightness: 'dark' | 'medium' | 'light';
  saturation: 'muted' | 'moderate' | 'vibrant';
}

export interface ColorPalette {
  id?: string;
  user_id: string;
  name: string;
  description?: string;
  colors: {
    primary: string;
    secondary?: string;
    accent?: string;
    colors: string[];
    harmony: string;
  };
  source_type: 'user_created' | 'extracted' | 'preset' | 'ai_generated';
  source_reference_id?: string;
  tags: string[];
  mood_tags: string[];
  style_compatibility: string[];
  space_compatibility: string[];
  color_temperature: 'warm' | 'cool' | 'neutral';
  brightness_level: 'dark' | 'medium' | 'light';
  saturation_level: 'muted' | 'moderate' | 'vibrant';
  times_used: number;
  last_used_at?: string;
  popularity_score: number;
  is_favorite: boolean;
  is_public: boolean;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface ColorAnalysis {
  dominant: string;
  palette: string[];
  temperature: 'warm' | 'cool' | 'neutral';
  brightness: 'dark' | 'medium' | 'light';
  saturation: 'muted' | 'moderate' | 'vibrant';
  harmony: string;
  mood: string[];
  styleCompatibility: string[];
}

/**
 * Service for extracting colors from images and creating color palettes
 */
export class ColorExtractionService {
  private static instance: ColorExtractionService;
  private colorThief: ColorThief;

  private constructor() {
    this.colorThief = new ColorThief();
  }

  public static getInstance(): ColorExtractionService {
    if (!ColorExtractionService.instance) {
      ColorExtractionService.instance = new ColorExtractionService();
    }
    return ColorExtractionService.instance;
  }

  /**
   * Load image for processing (handles CORS and format issues)
   */
  private async loadImage(imageUri: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Enable CORS
      
      img.onload = () => resolve(img);
      img.onerror = (error) => reject(new Error(`Failed to load image: ${error}`));
      
      // Handle data URLs or file URLs from expo
      if (imageUri.startsWith('data:') || imageUri.startsWith('file:')) {
        img.src = imageUri;
      } else {
        // For remote URLs, ensure CORS is handled
        img.src = imageUri;
      }
    });
  }

  /**
   * Convert RGB array to hex color
   */
  private rgbToHex(rgb: number[]): string {
    const [r, g, b] = rgb;
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
  }

  /**
   * Convert hex to RGB array
   */
  private hexToRgb(hex: string): number[] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0];
  }

  /**
   * Calculate color temperature (warm/cool/neutral)
   */
  private calculateColorTemperature(rgb: number[]): 'warm' | 'cool' | 'neutral' {
    const [r, g, b] = rgb;
    
    // Simple temperature calculation based on red vs blue dominance
    const warmScore = (r * 1.2 + g * 0.6) / 255;
    const coolScore = (b * 1.2 + g * 0.3) / 255;
    
    if (warmScore > coolScore + 0.15) return 'warm';
    if (coolScore > warmScore + 0.15) return 'cool';
    return 'neutral';
  }

  /**
   * Calculate brightness level
   */
  private calculateBrightness(rgb: number[]): 'dark' | 'medium' | 'light' {
    const [r, g, b] = rgb;
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    if (luminance < 0.3) return 'dark';
    if (luminance > 0.7) return 'light';
    return 'medium';
  }

  /**
   * Calculate saturation level
   */
  private calculateSaturation(rgb: number[]): 'muted' | 'moderate' | 'vibrant' {
    const [r, g, b] = rgb;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;
    
    if (saturation < 0.3) return 'muted';
    if (saturation > 0.7) return 'vibrant';
    return 'moderate';
  }

  /**
   * Generate complementary colors
   */
  private generateComplementary(rgb: number[]): string[] {
    const [r, g, b] = rgb;
    const comp = [255 - r, 255 - g, 255 - b];
    return [this.rgbToHex(comp)];
  }

  /**
   * Generate analogous colors
   */
  private generateAnalogous(rgb: number[]): string[] {
    // Convert to HSL, adjust hue by ±30 degrees, convert back
    const hsl = this.rgbToHsl(rgb);
    const analogous1 = this.hslToRgb([(hsl[0] + 30) % 360, hsl[1], hsl[2]]);
    const analogous2 = this.hslToRgb([(hsl[0] - 30 + 360) % 360, hsl[1], hsl[2]]);
    
    return [this.rgbToHex(analogous1), this.rgbToHex(analogous2)];
  }

  /**
   * Convert RGB to HSL
   */
  private rgbToHsl(rgb: number[]): number[] {
    const [r, g, b] = rgb.map(x => x / 255);
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [h * 360, s, l];
  }

  /**
   * Convert HSL to RGB
   */
  private hslToRgb(hsl: number[]): number[] {
    const [h, s, l] = [hsl[0] / 360, hsl[1], hsl[2]];

    if (s === 0) {
      return [l, l, l].map(x => Math.round(x * 255));
    }

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    const r = hue2rgb(p, q, h + 1/3);
    const g = hue2rgb(p, q, h);
    const b = hue2rgb(p, q, h - 1/3);

    return [r, g, b].map(x => Math.round(x * 255));
  }

  /**
   * Determine color harmony type
   */
  private determineHarmony(colors: string[]): 'complementary' | 'analogous' | 'triadic' | 'monochromatic' | 'split-complementary' {
    if (colors.length < 2) return 'monochromatic';
    
    // Simple harmony detection based on color relationships
    // This is a simplified version - more sophisticated analysis could be added
    const hues = colors.map(color => {
      const rgb = this.hexToRgb(color);
      const hsl = this.rgbToHsl(rgb);
      return hsl[0];
    });

    const hueDiffs = [];
    for (let i = 1; i < hues.length; i++) {
      let diff = Math.abs(hues[i] - hues[0]);
      if (diff > 180) diff = 360 - diff;
      hueDiffs.push(diff);
    }

    // Complementary: ~180 degree difference
    if (hueDiffs.some(diff => Math.abs(diff - 180) < 30)) {
      return 'complementary';
    }

    // Triadic: ~120 degree differences
    if (hueDiffs.some(diff => Math.abs(diff - 120) < 30)) {
      return 'triadic';
    }

    // Analogous: small differences (< 60 degrees)
    if (hueDiffs.every(diff => diff < 60)) {
      return 'analogous';
    }

    return 'split-complementary';
  }

  /**
   * Analyze color mood based on color properties
   */
  private analyzeMood(colors: DominantColors): string[] {
    const moods: string[] = [];
    
    // Temperature-based moods
    switch (colors.temperature) {
      case 'warm':
        moods.push('cozy', 'energetic', 'inviting');
        break;
      case 'cool':
        moods.push('calm', 'serene', 'refreshing');
        break;
      case 'neutral':
        moods.push('balanced', 'sophisticated', 'timeless');
        break;
    }

    // Brightness-based moods
    switch (colors.brightness) {
      case 'dark':
        moods.push('dramatic', 'intimate', 'mysterious');
        break;
      case 'light':
        moods.push('bright', 'airy', 'spacious');
        break;
      case 'medium':
        moods.push('comfortable', 'lived-in', 'welcoming');
        break;
    }

    // Saturation-based moods
    switch (colors.saturation) {
      case 'vibrant':
        moods.push('bold', 'playful', 'dynamic');
        break;
      case 'muted':
        moods.push('subtle', 'elegant', 'understated');
        break;
      case 'moderate':
        moods.push('harmonious', 'pleasing', 'versatile');
        break;
    }

    return moods.slice(0, 5); // Limit to 5 mood tags
  }

  /**
   * Determine style compatibility
   */
  private determineStyleCompatibility(colors: DominantColors): string[] {
    const styles: string[] = [];
    
    // Warm, muted colors
    if (colors.temperature === 'warm' && colors.saturation === 'muted') {
      styles.push('rustic', 'traditional', 'farmhouse', 'cozy-modern');
    }

    // Cool, light colors
    if (colors.temperature === 'cool' && colors.brightness === 'light') {
      styles.push('scandinavian', 'coastal', 'minimalist', 'contemporary');
    }

    // Neutral, medium colors
    if (colors.temperature === 'neutral' && colors.brightness === 'medium') {
      styles.push('modern', 'transitional', 'classic', 'timeless');
    }

    // Dark colors
    if (colors.brightness === 'dark') {
      styles.push('dramatic', 'moody', 'industrial', 'sophisticated');
    }

    // Vibrant colors
    if (colors.saturation === 'vibrant') {
      styles.push('eclectic', 'bohemian', 'maximalist', 'artistic');
    }

    return styles.slice(0, 6); // Limit to 6 style tags
  }

  /**
   * Extract colors from image URI
   */
  async extractColorsFromImage(
    imageUri: string,
    maxColors: number = 8
  ): Promise<DominantColors> {
    try {
      const img = await this.loadImage(imageUri);
      
      // Extract dominant color
      const dominantRgb = this.colorThief.getColor(img);
      const primaryColor = this.rgbToHex(dominantRgb);

      // Extract palette
      const paletteRgb = this.colorThief.getPalette(img, maxColors, 10);
      const paletteHex = paletteRgb.map(rgb => this.rgbToHex(rgb));

      // Secondary color (if available)
      const secondaryColor = paletteHex.length > 1 ? paletteHex[1] : undefined;

      // Analyze color properties
      const temperature = this.calculateColorTemperature(dominantRgb);
      const brightness = this.calculateBrightness(dominantRgb);
      const saturation = this.calculateSaturation(dominantRgb);

      // Determine harmony
      const harmony = this.determineHarmony(paletteHex);

      const colors: DominantColors = {
        primary: primaryColor,
        secondary: secondaryColor,
        palette: paletteHex,
        harmony,
        temperature,
        brightness,
        saturation
      };

      return colors;

    } catch (error) {
      console.error('Color extraction failed:', error);
      throw new Error(`Failed to extract colors: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create color palette from extracted colors
   */
  async createColorPalette(
    userId: string,
    name: string,
    colors: DominantColors,
    options: {
      description?: string;
      sourceReferenceId?: string;
      tags?: string[];
      isPublic?: boolean;
    } = {}
  ): Promise<ColorPalette> {
    try {
      // Analyze mood and style compatibility
      const moodTags = this.analyzeMood(colors);
      const styleCompatibility = this.determineStyleCompatibility(colors);

      const paletteData = {
        user_id: userId,
        name,
        description: options.description,
        colors: {
          primary: colors.primary,
          secondary: colors.secondary,
          accent: colors.palette[2], // Use third color as accent if available
          colors: colors.palette,
          harmony: colors.harmony
        },
        source_type: options.sourceReferenceId ? 'extracted' as const : 'user_created' as const,
        source_reference_id: options.sourceReferenceId,
        tags: options.tags || [],
        mood_tags: moodTags,
        style_compatibility: styleCompatibility,
        space_compatibility: [], // Will be determined by style compatibility
        color_temperature: colors.temperature,
        brightness_level: colors.brightness,
        saturation_level: colors.saturation,
        times_used: 0,
        popularity_score: 0,
        is_favorite: false,
        is_public: options.isPublic || false,
        rating: 0
      };

      const { data, error } = await supabase
        .from('user_color_palettes')
        .insert(paletteData)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to save color palette: ${error.message}`);
      }

      return data;

    } catch (error) {
      console.error('Failed to create color palette:', error);
      throw error;
    }
  }

  /**
   * Get user's color palettes
   */
  async getUserColorPalettes(userId?: string): Promise<ColorPalette[]> {
    try {
      let query = supabase
        .from('user_color_palettes')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch color palettes: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get user color palettes:', error);
      throw error;
    }
  }

  /**
   * Get public color palettes
   */
  async getPublicColorPalettes(limit: number = 20): Promise<ColorPalette[]> {
    try {
      const { data, error } = await supabase
        .from('user_color_palettes')
        .select('*')
        .eq('is_public', true)
        .order('popularity_score', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to fetch public color palettes: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get public color palettes:', error);
      throw error;
    }
  }

  /**
   * Get color palettes by style compatibility
   */
  async getColorPalettesByStyle(
    styles: string[],
    limit: number = 10
  ): Promise<ColorPalette[]> {
    try {
      const { data, error } = await supabase
        .from('user_color_palettes')
        .select('*')
        .overlaps('style_compatibility', styles)
        .eq('is_public', true)
        .order('popularity_score', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to fetch palettes by style: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get color palettes by style:', error);
      throw error;
    }
  }

  /**
   * Update color palette
   */
  async updateColorPalette(
    paletteId: string,
    updates: Partial<ColorPalette>
  ): Promise<ColorPalette> {
    try {
      const { data, error } = await supabase
        .from('user_color_palettes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', paletteId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update color palette: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Failed to update color palette:', error);
      throw error;
    }
  }

  /**
   * Delete color palette
   */
  async deleteColorPalette(paletteId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_color_palettes')
        .delete()
        .eq('id', paletteId);

      if (error) {
        throw new Error(`Failed to delete color palette: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to delete color palette:', error);
      throw error;
    }
  }

  /**
   * Toggle favorite status for color palette
   */
  async togglePaletteFavorite(paletteId: string): Promise<ColorPalette> {
    try {
      // Get current status
      const { data: current, error: fetchError } = await supabase
        .from('user_color_palettes')
        .select('is_favorite')
        .eq('id', paletteId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch current status: ${fetchError.message}`);
      }

      // Toggle favorite
      return await this.updateColorPalette(paletteId, {
        is_favorite: !current.is_favorite
      });

    } catch (error) {
      console.error('Failed to toggle palette favorite:', error);
      throw error;
    }
  }

  /**
   * Get user's favorite color palettes
   */
  async getFavoriteColorPalettes(userId?: string): Promise<ColorPalette[]> {
    try {
      let query = supabase
        .from('user_color_palettes')
        .select('*')
        .eq('is_favorite', true)
        .order('updated_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch favorite palettes: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get favorite color palettes:', error);
      throw error;
    }
  }

  /**
   * Search color palettes
   */
  async searchColorPalettes(
    query: string,
    filters: {
      temperature?: 'warm' | 'cool' | 'neutral';
      brightness?: 'dark' | 'medium' | 'light';
      saturation?: 'muted' | 'moderate' | 'vibrant';
      styles?: string[];
      publicOnly?: boolean;
      favoritesOnly?: boolean;
    } = {}
  ): Promise<ColorPalette[]> {
    try {
      let dbQuery = supabase
        .from('user_color_palettes')
        .select('*');

      // Text search
      if (query.trim()) {
        dbQuery = dbQuery.or(
          `name.ilike.%${query}%,description.ilike.%${query}%`
        );
      }

      // Apply filters
      if (filters.temperature) {
        dbQuery = dbQuery.eq('color_temperature', filters.temperature);
      }

      if (filters.brightness) {
        dbQuery = dbQuery.eq('brightness_level', filters.brightness);
      }

      if (filters.saturation) {
        dbQuery = dbQuery.eq('saturation_level', filters.saturation);
      }

      if (filters.styles?.length) {
        dbQuery = dbQuery.overlaps('style_compatibility', filters.styles);
      }

      if (filters.publicOnly) {
        dbQuery = dbQuery.eq('is_public', true);
      }

      if (filters.favoritesOnly) {
        dbQuery = dbQuery.eq('is_favorite', true);
      }

      const { data, error } = await dbQuery
        .order('popularity_score', { ascending: false })
        .limit(50);

      if (error) {
        throw new Error(`Palette search failed: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Color palette search failed:', error);
      throw error;
    }
  }

  /**
   * Generate complementary palette from base color
   */
  generateComplementaryPalette(baseColor: string): string[] {
    const rgb = this.hexToRgb(baseColor);
    const complementary = this.generateComplementary(rgb);
    const analogous = this.generateAnalogous(rgb);
    
    return [baseColor, ...complementary, ...analogous].slice(0, 5);
  }

  /**
   * Analyze color for quick properties
   */
  analyzeColor(hexColor: string): ColorAnalysis {
    const rgb = this.hexToRgb(hexColor);
    const colors: DominantColors = {
      primary: hexColor,
      palette: [hexColor],
      harmony: 'monochromatic',
      temperature: this.calculateColorTemperature(rgb),
      brightness: this.calculateBrightness(rgb),
      saturation: this.calculateSaturation(rgb)
    };

    return {
      dominant: hexColor,
      palette: [hexColor],
      temperature: colors.temperature,
      brightness: colors.brightness,
      saturation: colors.saturation,
      harmony: colors.harmony,
      mood: this.analyzeMood(colors),
      styleCompatibility: this.determineStyleCompatibility(colors)
    };
  }
}

// Export singleton instance
export const colorExtractionService = ColorExtractionService.getInstance();