import { MasonryImage } from '../masonryImages';

// Import a curated set of PNG assets from the masonry folder (36–40 images)
// Core sets that we verified exist in this folder
import img_industrial_kitchen from './industrial-kitchen.png';
import img_modern_living from './modern-living-room.png';
import img_ui_bath from './urban-industrial-bathroom.png';
import img_ui_bed from './urban-industrial-bedroom.png';
import img_ui_home_office from './urban-industrial-home-office.png';
import img_ui_kitchen from './urban-industrial-kitchen.png';
import img_ui_living from './urban-industrial-living-room.png';
import img_ui_loft from './urban-industrial-loft.png';
import img_ui_office from './urban-industrial-office.png';

import img_nr_bed from './natural-rustic-bedroom.png';
import img_nr_dining from './natural-rustic-dining.png';
import img_nr_kitchen from './natural-rustic-kitchen.png';
import img_nr_living from './natural-rustic-living-room.png';

import img_scandi_hygge_lr from './scandinavian-hygge-living-room.png';
import img_scandi_mod_kitchen from './scandinavian-modern-kitchen.png';

import img_cm_bath from './contemporary-modern-bathroom.png';
import img_cm_bed from './contemporary-modern-bedroom.png';
import img_cm_kitchen from './contemporary-modern-kitchen.png';
import img_cm_lr from './contemporary-modern-living-room.png';

import img_cmin_bed from './contemporary-minimalistic-bedroom.png';
import img_cmin_kitchen from './contemporary-minimalistic-kitchen.png';
import img_cmin_lr from './contemporary-minimalistic-living-room.png';
import img_cmin_office from './contemporary-minimalistic-office.png';

import img_csca_bed from './cultural-scandinavian-bedroom.png';
import img_csca_kitchen from './cultural-scandinavian-kitchen.png';
import img_csca_lr from './cultural-scandinavian-living-room.png';

import img_cmed_bed from './cultural-mediterranean-bedroom.png';
import img_cmed_home_office from './cultural-mediterranean-home-office.png';
import img_cmed_kitchen from './cultural-mediterranean-kitchen.png';
import img_cmed_lr from './cultural-mediterranean-living-room.png';

import img_interior_boh from './interior-bohemian.png';
import img_interior_ind from './interior-industrial.png';
import img_interior_min from './interior-minimalist.png';
import img_interior_mod from './interior-modern.png';
import img_interior_scan from './interior-scandinavian.png';

import img_entryway_mod from './modern-minimalist-entryway.png';
import img_sf_mod_lr from './single-family-modern-living-room.png';
import img_sf_trad_kitchen from './single-family-traditional-kitchen.png';
import img_town_georgian_foyer from './townhouse-georgian-foyer.png';
import img_town_mod_kitchen from './townhouse-modern-kitchen.png';

import img_french_salon from './french-chateau-grand-salon.png';
import img_lux_baroque_lr from './luxury-baroque-living-room.png';
import img_med_villa_suite from './mediterranean-villa-master-suite.png';
import img_victorian_parlor from './victorian-parlor-formal-sitting.png';

// Helper to create a record with slight dimension variance for masonry variety
const sq = (h: number): { width: number; height: number } => ({ width: 512, height: h });

export const showcaseMasonryImages: MasonryImage[] = [
  { source: img_modern_living, filename: 'modern-living-room.png', style: 'Modern', room: 'Living Room', orientation: 'landscape', dimensions: sq(384) },
  { source: img_industrial_kitchen, filename: 'industrial-kitchen.png', style: 'Industrial', room: 'Kitchen', orientation: 'square', dimensions: sq(512) },
  { source: img_ui_living, filename: 'urban-industrial-living-room.png', style: 'Urban Industrial', room: 'Living Room', orientation: 'landscape', dimensions: sq(384) },
  { source: img_ui_kitchen, filename: 'urban-industrial-kitchen.png', style: 'Urban Industrial', room: 'Kitchen', orientation: 'square', dimensions: sq(512) },
  { source: img_ui_bed, filename: 'urban-industrial-bedroom.png', style: 'Urban Industrial', room: 'Bedroom', orientation: 'portrait', dimensions: sq(640) },
  { source: img_ui_office, filename: 'urban-industrial-office.png', style: 'Urban Industrial', room: 'Office', orientation: 'square', dimensions: sq(512) },
  { source: img_ui_bath, filename: 'urban-industrial-bathroom.png', style: 'Urban Industrial', room: 'Bathroom', orientation: 'portrait', dimensions: sq(640) },
  { source: img_ui_loft, filename: 'urban-industrial-loft.png', style: 'Urban Industrial', room: 'Loft', orientation: 'landscape', dimensions: sq(384) },
  { source: img_ui_home_office, filename: 'urban-industrial-home-office.png', style: 'Urban Industrial', room: 'Home Office', orientation: 'square', dimensions: sq(512) },
  { source: img_nr_living, filename: 'natural-rustic-living-room.png', style: 'Natural Rustic', room: 'Living Room', orientation: 'landscape', dimensions: sq(384) },
  { source: img_nr_kitchen, filename: 'natural-rustic-kitchen.png', style: 'Natural Rustic', room: 'Kitchen', orientation: 'square', dimensions: sq(512) },
  { source: img_nr_bed, filename: 'natural-rustic-bedroom.png', style: 'Natural Rustic', room: 'Bedroom', orientation: 'portrait', dimensions: sq(640) },
  { source: img_nr_dining, filename: 'natural-rustic-dining.png', style: 'Natural Rustic', room: 'Dining', orientation: 'square', dimensions: sq(512) },
  { source: img_scandi_hygge_lr, filename: 'scandinavian-hygge-living-room.png', style: 'Scandinavian', room: 'Living Room', orientation: 'landscape', dimensions: sq(384) },
  { source: img_scandi_mod_kitchen, filename: 'scandinavian-modern-kitchen.png', style: 'Scandinavian', room: 'Kitchen', orientation: 'square', dimensions: sq(512) },
  { source: img_cm_lr, filename: 'contemporary-modern-living-room.png', style: 'Contemporary Modern', room: 'Living Room', orientation: 'square', dimensions: sq(512) },
  { source: img_cm_kitchen, filename: 'contemporary-modern-kitchen.png', style: 'Contemporary Modern', room: 'Kitchen', orientation: 'portrait', dimensions: sq(640) },
  { source: img_cm_bed, filename: 'contemporary-modern-bedroom.png', style: 'Contemporary Modern', room: 'Bedroom', orientation: 'landscape', dimensions: sq(384) },
  { source: img_cm_bath, filename: 'contemporary-modern-bathroom.png', style: 'Contemporary Modern', room: 'Bathroom', orientation: 'square', dimensions: sq(512) },
  { source: img_cmin_lr, filename: 'contemporary-minimalistic-living-room.png', style: 'Minimalistic', room: 'Living Room', orientation: 'square', dimensions: sq(512) },
  { source: img_cmin_kitchen, filename: 'contemporary-minimalistic-kitchen.png', style: 'Minimalistic', room: 'Kitchen', orientation: 'portrait', dimensions: sq(640) },
  { source: img_cmin_bed, filename: 'contemporary-minimalistic-bedroom.png', style: 'Minimalistic', room: 'Bedroom', orientation: 'landscape', dimensions: sq(384) },
  { source: img_cmin_office, filename: 'contemporary-minimalistic-office.png', style: 'Minimalistic', room: 'Office', orientation: 'square', dimensions: sq(512) },
  { source: img_csca_lr, filename: 'cultural-scandinavian-living-room.png', style: 'Cultural Scandinavian', room: 'Living Room', orientation: 'square', dimensions: sq(512) },
  { source: img_csca_kitchen, filename: 'cultural-scandinavian-kitchen.png', style: 'Cultural Scandinavian', room: 'Kitchen', orientation: 'portrait', dimensions: sq(640) },
  { source: img_csca_bed, filename: 'cultural-scandinavian-bedroom.png', style: 'Cultural Scandinavian', room: 'Bedroom', orientation: 'landscape', dimensions: sq(384) },
  { source: img_cmed_lr, filename: 'cultural-mediterranean-living-room.png', style: 'Cultural Mediterranean', room: 'Living Room', orientation: 'landscape', dimensions: sq(384) },
  { source: img_cmed_kitchen, filename: 'cultural-mediterranean-kitchen.png', style: 'Cultural Mediterranean', room: 'Kitchen', orientation: 'square', dimensions: sq(512) },
  { source: img_cmed_bed, filename: 'cultural-mediterranean-bedroom.png', style: 'Cultural Mediterranean', room: 'Bedroom', orientation: 'portrait', dimensions: sq(640) },
  { source: img_cmed_home_office, filename: 'cultural-mediterranean-home-office.png', style: 'Cultural Mediterranean', room: 'Home Office', orientation: 'square', dimensions: sq(512) },
  { source: img_interior_mod, filename: 'interior-modern.png', style: 'Interior Modern', room: 'Interior', orientation: 'square', dimensions: sq(512) },
  { source: img_interior_ind, filename: 'interior-industrial.png', style: 'Interior Industrial', room: 'Interior', orientation: 'square', dimensions: sq(512) },
  { source: img_interior_scan, filename: 'interior-scandinavian.png', style: 'Interior Scandinavian', room: 'Interior', orientation: 'square', dimensions: sq(512) },
  { source: img_interior_boh, filename: 'interior-bohemian.png', style: 'Interior Bohemian', room: 'Interior', orientation: 'square', dimensions: sq(512) },
  { source: img_interior_min, filename: 'interior-minimalist.png', style: 'Interior Minimalist', room: 'Interior', orientation: 'square', dimensions: sq(512) },
  { source: img_entryway_mod, filename: 'modern-minimalist-entryway.png', style: 'Modern Minimalist', room: 'Entryway', orientation: 'square', dimensions: sq(512) },
  { source: img_sf_mod_lr, filename: 'single-family-modern-living-room.png', style: 'Single Family Modern', room: 'Living Room', orientation: 'landscape', dimensions: sq(384) },
  { source: img_sf_trad_kitchen, filename: 'single-family-traditional-kitchen.png', style: 'Single Family Traditional', room: 'Kitchen', orientation: 'square', dimensions: sq(512) },
  { source: img_town_mod_kitchen, filename: 'townhouse-modern-kitchen.png', style: 'Townhouse Modern', room: 'Kitchen', orientation: 'square', dimensions: sq(512) },
  { source: img_town_georgian_foyer, filename: 'townhouse-georgian-foyer.png', style: 'Townhouse Georgian', room: 'Foyer', orientation: 'portrait', dimensions: sq(640) },
  { source: img_victorian_parlor, filename: 'victorian-parlor-formal-sitting.png', style: 'Victorian', room: 'Parlor', orientation: 'portrait', dimensions: sq(640) },
  { source: img_french_salon, filename: 'french-chateau-grand-salon.png', style: 'French Chateau', room: 'Salon', orientation: 'landscape', dimensions: sq(384) },
  { source: img_lux_baroque_lr, filename: 'luxury-baroque-living-room.png', style: 'Luxury Baroque', room: 'Living Room', orientation: 'square', dimensions: sq(512) },
  { source: img_med_villa_suite, filename: 'mediterranean-villa-master-suite.png', style: 'Mediterranean Villa', room: 'Suite', orientation: 'portrait', dimensions: sq(640) },
];

export default showcaseMasonryImages;
