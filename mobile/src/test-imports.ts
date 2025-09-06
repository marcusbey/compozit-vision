// Test file to verify all component imports work correctly
// This file should compile without errors if all imports are correct

// Test moved components
import { CameraSection } from '@components/camera/CameraSection';
import { PhotoGuidelines } from '@components/camera/PhotoGuidelines';
import { CameraInterface } from '@components/camera/CameraInterface';

import { PanelRouter } from '@components/wizard/PanelRouter';
import { ImageDisplayArea } from '@components/wizard/ImageDisplayArea';

import { SlidingBottomPanel } from '@components/panels/SlidingBottomPanel';
import { InitialPanel } from '@components/panels/InitialPanel';
import { PromptPanel } from '@components/panels/PromptPanel';
import { ProcessingPanel } from '@components/panels/ProcessingPanel';

import { FilterTabs } from '@components/shared/FilterTabs';
import { WizardScreenLayout } from '@components/shared/WizardScreenLayout';
import { CategoryCard } from '@components/shared/CategoryCard';

// Test that these exports exist
export {
  CameraSection,
  PhotoGuidelines,
  CameraInterface,
  PanelRouter,
  ImageDisplayArea,
  SlidingBottomPanel,
  InitialPanel,
  PromptPanel,
  ProcessingPanel,
  FilterTabs,
  WizardScreenLayout,
  CategoryCard
};

console.log('All component imports successful!');