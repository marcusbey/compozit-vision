import { useState, useEffect } from 'react';
import { supabase } from '../../../../services/supabase';
import { tokens } from '@theme';

export interface DatabaseCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  category_type: 'interior' | 'garden' | 'surface' | 'object' | 'exterior';
  icon_name: string;
  image_url?: string;
  thumbnail_url?: string;
  color_scheme: {
    primary: string;
    secondary: string;
    accent?: string;
  };
  display_order: number;
  is_featured: boolean;
  usage_count: number;
  popularity_score: number;
  complexity_level: number;
  compatible_rooms?: string[];
  compatible_styles?: string[];
  created_at: string;
}

export const useCategoryData = (typeFilter: string = 'all') => {
  const [categories, setCategories] = useState<DatabaseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const createFallbackCategories = (): DatabaseCategory[] => [
    {
      id: '1',
      name: 'Interior Design',
      slug: 'interior-design',
      description: 'Transform your indoor spaces with style and functionality',
      category_type: 'interior',
      icon_name: 'home',
      color_scheme: { primary: '#C9A98C', secondary: '#B9906F', accent: '#8B7355' },
      display_order: 1,
      is_featured: true,
      usage_count: 0,
      popularity_score: 1.0,
      complexity_level: 3,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Garden & Landscape',
      slug: 'garden-landscape',
      description: 'Create beautiful outdoor spaces and landscapes',
      category_type: 'garden',
      icon_name: 'leaf',
      color_scheme: { primary: '#7FB069', secondary: '#588B8B', accent: '#4A5D23' },
      display_order: 2,
      is_featured: true,
      usage_count: 0,
      popularity_score: 0.8,
      complexity_level: 4,
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Surface Design',
      slug: 'surface-design',
      description: 'Focus on walls, floors, and surface treatments',
      category_type: 'surface',
      icon_name: 'square',
      color_scheme: { primary: '#D4A574', secondary: '#C9A98C', accent: '#B8935F' },
      display_order: 3,
      is_featured: false,
      usage_count: 0,
      popularity_score: 0.6,
      complexity_level: 2,
      created_at: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Object Styling',
      slug: 'object-styling',
      description: 'Curate and style individual pieces and collections',
      category_type: 'object',
      icon_name: 'cube',
      color_scheme: { primary: '#E07A5F', secondary: '#F4A261', accent: '#E76F51' },
      display_order: 4,
      is_featured: false,
      usage_count: 0,
      popularity_score: 0.5,
      complexity_level: 2,
      created_at: new Date().toISOString()
    },
    {
      id: '5',
      name: 'Exterior Design',
      slug: 'exterior-design',
      description: 'Enhance your home\'s curb appeal and outdoor aesthetics',
      category_type: 'exterior',
      icon_name: 'business',
      color_scheme: { primary: '#264653', secondary: '#2A9D8F', accent: '#1D3557' },
      display_order: 5,
      is_featured: false,
      usage_count: 0,
      popularity_score: 0.4,
      complexity_level: 5,
      created_at: new Date().toISOString()
    }
  ];

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('categories')
        .select(`
          id, name, slug, description, category_type, icon_name,
          image_url, thumbnail_url, color_scheme, display_order,
          is_featured, usage_count, popularity_score, complexity_level, created_at
        `)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (typeFilter !== 'all') {
        query = query.eq('category_type', typeFilter);
      }

      const { data: categoriesData, error: dbError } = await query;

      if (dbError || !categoriesData?.length) {
        console.warn('Database query failed, using fallback:', dbError?.message);
        setCategories(createFallbackCategories());
        return;
      }

      const transformedCategories: DatabaseCategory[] = categoriesData.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        category_type: cat.category_type,
        icon_name: cat.icon_name,
        image_url: cat.image_url,
        thumbnail_url: cat.thumbnail_url,
        color_scheme: cat.color_scheme || { 
          primary: tokens.color.brand, 
          secondary: tokens.color.brandHover 
        },
        display_order: cat.display_order || 999,
        is_featured: cat.is_featured || false,
        usage_count: cat.usage_count || 0,
        popularity_score: cat.popularity_score || 0,
        complexity_level: cat.complexity_level || 1,
        created_at: cat.created_at
      }));
      
      setCategories(transformedCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      setError('Failed to load categories - using fallback data');
      setCategories(createFallbackCategories());
    } finally {
      setLoading(false);
    }
  };

  const incrementUsage = async (categoryId: string) => {
    try {
      const { data: categoryData, error: fetchError } = await supabase
        .from('categories')
        .select('usage_count')
        .eq('id', categoryId)
        .single();
      
      if (!fetchError && categoryData) {
        await supabase
          .from('categories')
          .update({ 
            usage_count: (categoryData.usage_count || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', categoryId);
      }
    } catch (error) {
      console.warn('Failed to update category usage:', error);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [typeFilter]);

  return {
    categories,
    loading,
    error,
    loadCategories,
    incrementUsage
  };
};