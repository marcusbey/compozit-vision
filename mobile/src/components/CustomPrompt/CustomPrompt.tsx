import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Keyboard,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { SuggestionChips } from './SuggestionChips';
import { CharacterCounter } from './CharacterCounter';
import { CustomPromptProps, CustomPrompt as CustomPromptType, PromptContext } from '../../types/furniture';
import { SpaceAnalysisService } from '../../services/furniture/SpaceAnalysisService';
import { colors } from '../../theme/colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const CustomPrompt: React.FC<CustomPromptProps> = ({
  initialText = '',
  placeholder = 'Describe your ideal furniture style or specific requirements...',
  suggestions = [],
  context,
  maxLength = 500,
  onTextChange,
  onPromptSubmit,
  onSuggestionSelect,
  isExpanded = false,
  onExpandToggle,
}) => {
  const [text, setText] = useState(initialText);
  const [isFocused, setIsFocused] = useState(false);
  const [expanded, setExpanded] = useState(isExpanded);
  const [contextualSuggestions, setContextualSuggestions] = useState<string[]>([]);
  
  const textInputRef = useRef<TextInput>(null);
  
  // Animation values
  const containerHeight = useSharedValue(expanded ? 200 : 80);
  const expandIconRotation = useSharedValue(expanded ? 180 : 0);
  const suggestionOpacity = useSharedValue(expanded ? 1 : 0);

  // Generate contextual suggestions when context changes
  useEffect(() => {
    if (context) {
      const generated = SpaceAnalysisService.generateContextualPrompts(context);
      setContextualSuggestions(generated);
    }
  }, [context]);

  // Combine provided suggestions with contextual ones
  const allSuggestions = [...suggestions, ...contextualSuggestions];

  // Handle text changes
  const handleTextChange = useCallback((newText: string) => {
    if (newText.length <= maxLength) {
      setText(newText);
      onTextChange(newText);
    }
  }, [maxLength, onTextChange]);

  // Handle expand/collapse
  const handleExpandToggle = useCallback(() => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    
    // Animate container
    containerHeight.value = withSpring(newExpanded ? 200 : 80, {
      damping: 20,
      stiffness: 100,
    });
    
    // Animate expand icon
    expandIconRotation.value = withSpring(newExpanded ? 180 : 0, {
      damping: 15,
      stiffness: 150,
    });
    
    // Animate suggestions
    suggestionOpacity.value = withTiming(newExpanded ? 1 : 0, {
      duration: newExpanded ? 300 : 200,
    });
    
    onExpandToggle?.(newExpanded);
    
    // Focus text input when expanding
    if (newExpanded) {
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 100);
    }
  }, [expanded, containerHeight, expandIconRotation, suggestionOpacity, onExpandToggle]);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: string) => {
    const newText = text ? `${text} ${suggestion}` : suggestion;
    if (newText.length <= maxLength) {
      setText(newText);
      onTextChange(newText);
      onSuggestionSelect(suggestion);
    }
  }, [text, maxLength, onTextChange, onSuggestionSelect]);

  // Handle submit
  const handleSubmit = useCallback(() => {
    if (text.trim()) {
      const prompt: CustomPromptType = {
        id: `custom-${Date.now()}`,
        text: text.trim(),
        isUserGenerated: true,
        context,
        suggestions: allSuggestions,
        tags: extractTags(text),
      };
      onPromptSubmit(prompt);
    }
  }, [text, context, allSuggestions, onPromptSubmit]);

  // Handle focus events
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (!expanded) {
      handleExpandToggle();
    }
  }, [expanded, handleExpandToggle]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  // Animation styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    height: containerHeight.value,
  }));

  const expandIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${expandIconRotation.value}deg` }],
  }));

  const suggestionsStyle = useAnimatedStyle(() => ({
    opacity: suggestionOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.promptContainer, containerAnimatedStyle]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Icon name="edit" size={20} color={colors.primary[500]} />
            <Text style={styles.title}>Custom Prompt</Text>
          </View>
          
          <AnimatedTouchableOpacity
            style={[styles.expandButton, expandIconStyle]}
            onPress={handleExpandToggle}
          >
            <Icon name="keyboard-arrow-down" size={24} color={colors.gray[500]} />
          </AnimatedTouchableOpacity>
        </View>

        {/* Text Input */}
        <View style={[styles.inputContainer, isFocused && styles.inputContainerFocused]}>
          <TextInput
            ref={textInputRef}
            style={[
              styles.textInput,
              expanded ? styles.textInputExpanded : styles.textInputCollapsed,
            ]}
            value={text}
            onChangeText={handleTextChange}
            placeholder={placeholder}
            placeholderTextColor={colors.gray[400]}
            multiline
            maxLength={maxLength}
            onFocus={handleFocus}
            onBlur={handleBlur}
            textAlignVertical="top"
          />
          
          {/* Character Counter */}
          {expanded && (
            <CharacterCounter
              current={text.length}
              max={maxLength}
              style={styles.characterCounter}
            />
          )}
        </View>

        {/* Suggestions */}
        {expanded && (
          <Animated.View style={[styles.suggestionsContainer, suggestionsStyle]}>
            <SuggestionChips
              suggestions={allSuggestions}
              onSuggestionPress={handleSuggestionSelect}
              maxChips={6}
            />
          </Animated.View>
        )}

        {/* Submit Button */}
        {expanded && text.trim() && (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <Icon name="send" size={20} color="white" />
            <Text style={styles.submitText}>Use Custom Prompt</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Context Info */}
      {context && expanded && (
        <View style={styles.contextInfo}>
          <Text style={styles.contextLabel}>Suggestions based on:</Text>
          <View style={styles.contextTags}>
            {context.roomType && (
              <View style={styles.contextTag}>
                <Text style={styles.contextTagText}>
                  {context.roomType.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            )}
            {context.spaceCharacteristics?.size && (
              <View style={styles.contextTag}>
                <Text style={styles.contextTagText}>
                  {context.spaceCharacteristics.size.toUpperCase()} SPACE
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

// Helper function to extract tags from text
const extractTags = (text: string): string[] => {
  const words = text.toLowerCase().split(/\s+/);
  const furnitureKeywords = [
    'modern', 'vintage', 'rustic', 'contemporary', 'traditional', 'industrial',
    'minimalist', 'cozy', 'elegant', 'comfortable', 'functional', 'storage',
    'seating', 'table', 'chair', 'sofa', 'bed', 'desk', 'shelf', 'cabinet'
  ];
  
  return words.filter(word => furnitureKeywords.includes(word));
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  promptContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[800],
    marginLeft: 8,
  },
  expandButton: {
    padding: 4,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 12,
    backgroundColor: colors.gray[50],
    marginBottom: 12,
  },
  inputContainerFocused: {
    borderColor: colors.primary[400],
    backgroundColor: 'white',
  },
  textInput: {
    fontSize: 16,
    color: colors.gray[800],
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textInputCollapsed: {
    height: 40,
  },
  textInputExpanded: {
    height: 80,
    textAlignVertical: 'top',
  },
  characterCounter: {
    position: 'absolute',
    bottom: 8,
    right: 12,
  },
  suggestionsContainer: {
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: colors.primary[500],
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  contextInfo: {
    marginTop: 12,
    paddingHorizontal: 4,
  },
  contextLabel: {
    fontSize: 12,
    color: colors.gray[500],
    marginBottom: 6,
  },
  contextTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  contextTag: {
    backgroundColor: colors.primary[100],
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  contextTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary[700],
  },
});