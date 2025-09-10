import React from 'react';
import { PanelMode } from '../../screens/04-project-wizard/Wizard-Screen/constants/wizardData';
import { FeatureId, ProjectContext } from '../../utils/contextAnalysis';
import { InitialPanel } from '../panels/InitialPanel';
import { ProcessingPanel } from '../panels/ProcessingPanel';
import { PromptPanel } from '../panels/PromptPanel';

interface PanelRouterProps {
  panelMode: PanelMode;

  // Initial Panel Props
  onTakePhoto: () => void;
  onImportPhoto: () => void;
  onSampleSelect: (uri: string) => void;

  // Prompt Panel Props
  userPrompt: string;
  onPromptChange: (text: string) => void;
  onProcess: () => void;
  contextAnalysis?: {
    primaryContext: ProjectContext;
    confidence: number;
    suggestedFeatures: FeatureId[];
  };
  availableFeatures: FeatureId[];
  onFeaturePress: (feature: FeatureId) => void;
  isProcessing: boolean;

  // Other Panel Props (to be extended)
  onBack: () => void;
}

export const PanelRouter: React.FC<PanelRouterProps> = ({
  panelMode,
  onTakePhoto,
  onImportPhoto,
  onSampleSelect,
  userPrompt,
  onPromptChange,
  onProcess,
  contextAnalysis,
  availableFeatures,
  onFeaturePress,
  isProcessing,
  onBack,
}) => {
  switch (panelMode) {
    case 'initial':
      return (
        <InitialPanel
          onTakePhoto={onTakePhoto}
          onImportPhoto={onImportPhoto}
          onSampleSelect={onSampleSelect}
        />
      );

    case 'prompt':
      return (
        <PromptPanel
          userPrompt={userPrompt}
          onPromptChange={onPromptChange}
          onProcess={onProcess}
          contextAnalysis={contextAnalysis}
          availableFeatures={availableFeatures}
          onFeaturePress={onFeaturePress}
          isProcessing={isProcessing}
        />
      );

    case 'processing':
      return <ProcessingPanel />;

    // TODO: Add other panels as they are created
    case 'category':
    case 'style':
    case 'reference':
    case 'colorPalette':
    case 'budget':
    case 'furniture':
    case 'location':
    case 'materials':
    case 'texture':
    case 'auth':
    default:
      return (
        <PromptPanel
          userPrompt={userPrompt}
          onPromptChange={onPromptChange}
          onProcess={onProcess}
          contextAnalysis={contextAnalysis}
          availableFeatures={availableFeatures}
          onFeaturePress={onFeaturePress}
          isProcessing={isProcessing}
        />
      );
  }
};
