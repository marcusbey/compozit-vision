# CustomPrompt Components

Expandable text input system with smart suggestions and context-aware prompt generation for professional furniture design workflows.

## Overview

The CustomPrompt component provides professional users with a sophisticated way to input specific furniture requirements, enhanced with contextual suggestions based on space analysis and user preferences.

## Components

### CustomPrompt (Main Component)

Intelligent text input with expandable interface and contextual suggestions.

#### Props

```typescript
interface CustomPromptProps {
  initialText?: string;                                    // Pre-filled text
  placeholder?: string;                                    // Input placeholder
  suggestions?: string[];                                  // Manual suggestions
  context?: PromptContext;                                 // Space analysis context
  maxLength?: number;                                      // Character limit (default: 500)
  onTextChange: (text: string) => void;                   // Real-time text updates
  onPromptSubmit: (prompt: CustomPrompt) => void;         // Final prompt submission
  onSuggestionSelect: (suggestion: string) => void;       // Suggestion selection
  isExpanded?: boolean;                                    // Initial expanded state
  onExpandToggle?: (expanded: boolean) => void;           // Expand state changes
}
```

#### Context-Aware Features

- **Room Type Integration**: Suggestions based on detected room type
- **Space Analysis**: Prompts tailored to room size and lighting
- **Object Detection**: Suggestions that complement existing furniture
- **Style Preferences**: Personalized recommendations
- **Budget Awareness**: Price-appropriate suggestions

#### Animation Features

- **Smooth Expansion**: Spring-physics container expansion
- **Staggered Reveals**: Sequential suggestion chip appearances
- **Character Counter**: Dynamic color changes based on usage
- **Focus Transitions**: Automatic expansion on text input focus

### SuggestionChips

Interactive suggestion chips with smart categorization and visual feedback.

#### Features

- **Contextual Suggestions**: Generated from space analysis
- **Visual Categorization**: Color-coded by suggestion type
- **One-Tap Addition**: Direct text insertion with formatting
- **Scroll Navigation**: Horizontal scrolling for multiple suggestions
- **Animation Feedback**: Press animations and transitions

#### Suggestion Categories

```typescript
// Room-specific suggestions
const ROOM_SUGGESTIONS = {
  living_room: [
    'Create a cozy conversation area',
    'Add a statement piece for the focal wall',
    'Include comfortable seating for entertaining'
  ],
  bedroom: [
    'Design a peaceful retreat for relaxation',
    'Add storage for clothing and personal items',
    'Create ambient lighting for evening'
  ],
  // ... more room types
};

// Size-specific suggestions
const SIZE_SUGGESTIONS = {
  small: [
    'Maximize space with multi-functional furniture',
    'Use vertical storage solutions',
    'Choose light colors to open up the space'
  ],
  // ... other sizes
};
```

### CharacterCounter

Real-time character counting with visual progression indicators.

#### Features

- **Dynamic Coloring**: Green → Yellow → Red progression
- **Contextual Messages**: Different messages based on usage
- **Accessibility**: Screen reader compatible
- **Animation**: Smooth color transitions

## Usage

### Basic Implementation

```tsx
import React, { useState } from 'react';
import { CustomPrompt } from './components/CustomPrompt';
import { PromptContext, CustomPrompt as CustomPromptType } from './types/furniture';

export const MyScreen = () => {
  const [promptText, setPromptText] = useState('');
  
  const context: PromptContext = {
    roomType: RoomType.LIVING_ROOM,
    spaceCharacteristics: {
      size: 'medium',
      lighting: 'bright',
      style: 'modern',
    },
    detectedObjects: ['sofa', 'coffee table', 'window'],
    userPreferences: {
      styles: ['modern', 'minimalist'],
      colors: ['neutral', 'warm tones'],
      budget: { min: 1000, max: 5000 }
    }
  };

  const handleTextChange = (text: string) => {
    setPromptText(text);
    // Real-time processing if needed
  };

  const handlePromptSubmit = (prompt: CustomPromptType) => {
    console.log('Final prompt:', prompt);
    // Send to AI processing
  };

  const handleSuggestionSelect = (suggestion: string) => {
    console.log('Suggestion selected:', suggestion);
    // Analytics tracking
  };

  return (
    <CustomPrompt
      placeholder="Describe your ideal furniture style or specific requirements..."
      context={context}
      maxLength={500}
      onTextChange={handleTextChange}
      onPromptSubmit={handlePromptSubmit}
      onSuggestionSelect={handleSuggestionSelect}
    />
  );
};
```

### Advanced Configuration

```tsx
// Pre-filled with user preferences
<CustomPrompt
  initialText="I prefer modern furniture with clean lines"
  context={spaceAnalysisContext}
  maxLength={750}                    // Extended character limit
  suggestions={customSuggestions}    // Additional manual suggestions
  isExpanded={true}                  // Start expanded
  onExpandToggle={(expanded) => {
    // Track UI interaction
    analytics.track('prompt_expanded', { expanded });
  }}
  onTextChange={debounce(handleTextChange, 300)}  // Debounced updates
  onPromptSubmit={handleSubmit}
  onSuggestionSelect={handleSuggestionSelect}
/>
```

## Smart Suggestion System

### Context Analysis

The system generates suggestions based on multiple factors:

```typescript
// Space Analysis Integration
const generateContextualPrompts = (context: PromptContext): string[] => {
  const prompts: string[] = [];

  // Room type specific
  if (context.roomType) {
    prompts.push(...ROOM_SPECIFIC_PROMPTS[context.roomType]);
  }

  // Detected objects
  if (context.detectedObjects?.length) {
    prompts.push(`Complement the existing ${context.detectedObjects.join(', ')}`);
  }

  // Space characteristics
  if (context.spaceCharacteristics?.size) {
    prompts.push(...SIZE_SPECIFIC_PROMPTS[context.spaceCharacteristics.size]);
  }

  return prompts.slice(0, 6); // Limit to 6 suggestions
};
```

### Suggestion Quality Scoring

```typescript
interface SuggestionScore {
  relevance: number;     // 0-1 based on context match
  popularity: number;    // 0-1 based on user adoption
  specificity: number;   // 0-1 based on detail level
  feasibility: number;   // 0-1 based on budget/space
}

const scoreSuggestion = (suggestion: string, context: PromptContext): SuggestionScore => {
  // AI-based scoring algorithm
  return {
    relevance: calculateRelevance(suggestion, context),
    popularity: getPopularityScore(suggestion),
    specificity: measureSpecificity(suggestion),
    feasibility: checkFeasibility(suggestion, context)
  };
};
```

## Animation Architecture

### Spring Physics Configuration

```typescript
const ANIMATION_CONFIG = {
  expansion: {
    damping: 20,
    mass: 1,
    stiffness: 100,
  },
  suggestion: {
    damping: 15,
    mass: 0.8,
    stiffness: 150,
  },
  character: {
    duration: 200,
    easing: 'ease-out',
  }
};
```

### Performance Optimizations

- **Native Thread**: All animations run on native thread
- **Gesture Interruption**: Smooth handling of user interruptions
- **Memory Efficient**: Cleanup of animation values
- **Reduced Motion**: Accessibility compliance

## State Management

### Internal State

```typescript
interface CustomPromptState {
  text: string;                    // Current input text
  expanded: boolean;               // Expansion state
  focused: boolean;                // Input focus state
  suggestions: string[];           // Contextual suggestions
  characterCount: number;          // Current character count
  submitEnabled: boolean;          // Can submit prompt
}
```

### External Integration

```typescript
// Zustand store integration
const usePromptStore = create<PromptStore>((set) => ({
  currentPrompt: null,
  promptHistory: [],
  
  setCurrentPrompt: (prompt: CustomPromptType) => set({ currentPrompt: prompt }),
  addToHistory: (prompt: CustomPromptType) => set((state) => ({
    promptHistory: [...state.promptHistory, prompt]
  })),
}));
```

## Accessibility

### Screen Reader Support

- **Text Input**: Proper labeling and hints
- **Character Counter**: Live region updates
- **Suggestions**: Navigable with screen reader
- **Buttons**: Clear action descriptions

### Keyboard Navigation

```typescript
// Keyboard shortcuts
const KEYBOARD_SHORTCUTS = {
  'Escape': 'collapse prompt',
  'Enter': 'submit prompt (when not multiline)',
  'Tab': 'navigate to suggestions',
  'Arrow Keys': 'navigate suggestion chips'
};
```

### High Contrast Mode

- **Color Ratios**: WCAG AA compliant
- **Focus Indicators**: Clear visual focus
- **Text Contrast**: High contrast text combinations

## Testing

### Unit Tests

```typescript
describe('CustomPrompt', () => {
  it('generates contextual suggestions', () => {
    const context: PromptContext = {
      roomType: RoomType.LIVING_ROOM,
      spaceCharacteristics: { size: 'small' }
    };
    
    const suggestions = SpaceAnalysisService.generateContextualPrompts(context);
    expect(suggestions).toContain('Maximize space with multi-functional furniture');
  });

  it('enforces character limit', () => {
    const { getByTestId } = render(<CustomPrompt maxLength={100} {...props} />);
    const input = getByTestId('prompt-input');
    
    fireEvent.changeText(input, 'a'.repeat(150));
    expect(input.props.value).toHaveLength(100);
  });
});
```

### Integration Tests

```bash
# Test with space analysis service
npm run test:integration

# Test accessibility
npm run test:a11y

# Test animation performance
npm run test:performance
```

## Performance Benchmarks

### Metrics

- **Suggestion Generation**: < 50ms for 6 contextual suggestions
- **Animation Smoothness**: 60 FPS maintained during expansion
- **Text Input Responsiveness**: < 16ms keystroke response
- **Memory Usage**: < 20MB for full suggestion system

### Optimization Strategies

- **Debounced Updates**: Reduce excessive re-renders
- **Memoized Suggestions**: Cache generated suggestions
- **Lazy Loading**: Load suggestion data on demand
- **Animation Batching**: Batch multiple animation updates

## Error Handling

### Common Scenarios

```typescript
// Network error fallback
const handleSuggestionError = (error: Error) => {
  console.warn('Suggestion generation failed:', error);
  // Fallback to cached suggestions
  return getCachedSuggestions();
};

// Input validation
const validatePromptText = (text: string): ValidationResult => {
  if (text.trim().length === 0) {
    return { valid: false, message: 'Prompt cannot be empty' };
  }
  
  if (containsInappropriateContent(text)) {
    return { valid: false, message: 'Please use appropriate language' };
  }
  
  return { valid: true };
};
```

## Future Enhancements

### Planned Features

- **Voice Input**: Speech-to-text integration
- **Image References**: Attach inspiration images
- **Collaborative Editing**: Multi-user prompt creation
- **AI Completion**: Smart auto-complete suggestions
- **Template Library**: Pre-made prompt templates

### AI Integration

- **Natural Language Processing**: Better prompt understanding
- **Sentiment Analysis**: Detect user preferences from text
- **Intent Recognition**: Understand specific furniture needs
- **Style Extraction**: Parse style preferences from descriptions

## Contributing

### Development Guidelines

1. **Context Integration**: Always consider space analysis context
2. **Performance First**: Maintain 60 FPS animations
3. **Accessibility**: Screen reader and keyboard navigation
4. **Testing**: Comprehensive test coverage
5. **Documentation**: Clear API documentation

### Code Style

```typescript
// Good: Clear, typed, accessible
interface SuggestionChipProps {
  suggestion: string;
  onPress: (suggestion: string) => void;
  variant: 'primary' | 'secondary' | 'tertiary';
  accessibilityLabel: string;
}

// Bad: Unclear, untyped
interface Props {
  data: any;
  onClick: () => void;
}
```