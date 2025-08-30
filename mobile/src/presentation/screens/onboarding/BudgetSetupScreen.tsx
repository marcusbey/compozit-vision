// Budget Setup Screen - Budget Range Selection
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import { OnboardingProgress } from './components/OnboardingProgress';

const { width } = Dimensions.get('window');

interface BudgetRange {
  id: string;
  name: string;
  min: number;
  max: number;
  description: string;
  popular?: boolean;
}

const budgetRanges: BudgetRange[] = [
  {
    id: 'budget',
    name: 'Budget-Friendly',
    min: 100,
    max: 500,
    description: 'Affordable pieces with great style',
  },
  {
    id: 'moderate',
    name: 'Moderate',
    min: 500,
    max: 1500,
    description: 'Balance of quality and value',
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    min: 1500,
    max: 3000,
    description: 'Higher-end furniture and decor',
  },
  {
    id: 'luxury',
    name: 'Luxury',
    min: 3000,
    max: 10000,
    description: 'Designer pieces and luxury items',
  },
  {
    id: 'custom',
    name: 'Custom Range',
    min: 0,
    max: 15000,
    description: 'Set your own budget range',
  },
];

interface BudgetCardProps {
  budget: BudgetRange;
  selected: boolean;
  onSelect: () => void;
  animationDelay: number;
}

const BudgetCard: React.FC<BudgetCardProps> = ({ budget, selected, onSelect, animationDelay }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const selectionAnim = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }, animationDelay);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, animationDelay]);

  useEffect(() => {
    Animated.timing(selectionAnim, {
      toValue: selected ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [selected, selectionAnim]);

  const borderColor = selectionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E5E5EA', '#007AFF'],
  });

  const backgroundColor = selectionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['white', '#F0F8FF'],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Animated.View
      style={[
        styles.budgetCard,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          borderColor,
          backgroundColor,
        }
      ]}
    >
      <TouchableOpacity
        onPress={onSelect}
        style={styles.budgetCardContent}
        activeOpacity={0.7}
      >
        <View style={styles.budgetHeader}>
          <View style={styles.budgetTitleContainer}>
            <Text style={styles.budgetName}>{budget.name}</Text>
            {budget.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>Popular</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.budgetRange}>
            {budget.id === 'custom' 
              ? 'Flexible' 
              : `${formatCurrency(budget.min)} - ${formatCurrency(budget.max)}`}
          </Text>
        </View>
        
        <Text style={styles.budgetDescription}>{budget.description}</Text>

        {selected && (
          <View style={styles.checkmarkContainer}>
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export const BudgetSetupScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const [customRange, setCustomRange] = useState({ min: 500, max: 2000 });
  const [currentQuestion] = useState(2);
  const totalQuestions = 5;

  const titleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(titleAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [titleAnim]);

  const handleBudgetSelect = (budgetId: string) => {
    setSelectedBudget(budgetId);
  };

  const handleCustomRangeChange = (value: number, isMin: boolean) => {
    setCustomRange(prev => ({
      ...prev,
      [isMin ? 'min' : 'max']: Math.round(value)
    }));
  };

  const handleContinue = () => {
    if (!selectedBudget) return;
    
    let budgetData;
    if (selectedBudget === 'custom') {
      budgetData = customRange;
    } else {
      const selected = budgetRanges.find(b => b.id === selectedBudget);
      budgetData = selected ? { min: selected.min, max: selected.max } : null;
    }

    // @ts-ignore
    navigation.navigate('Tutorial', { 
      ...route.params,
      budgetRange: budgetData 
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      <OnboardingProgress
        currentStep={currentQuestion}
        totalSteps={totalQuestions}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.header,
            {
              opacity: titleAnim,
              transform: [{
                translateY: titleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                })
              }]
            }
          ]}
        >
          <Text style={styles.title}>What's your budget?</Text>
          <Text style={styles.subtitle}>
            Help us show you furniture and decor that fits your budget.
            You can always adjust this later.
          </Text>
        </Animated.View>

        <View style={styles.budgetOptions}>
          {budgetRanges.map((budget, index) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              selected={selectedBudget === budget.id}
              onSelect={() => handleBudgetSelect(budget.id)}
              animationDelay={200 + index * 100}
            />
          ))}
        </View>

        {selectedBudget === 'custom' && (
          <Animated.View
            style={[
              styles.customRangeContainer,
              {
                opacity: titleAnim,
              }
            ]}
          >
            <Text style={styles.customRangeTitle}>Set Your Custom Range</Text>
            
            <View style={styles.sliderContainer}>
              <View style={styles.sliderRow}>
                <Text style={styles.sliderLabel}>Minimum:</Text>
                <Text style={styles.sliderValue}>{formatCurrency(customRange.min)}</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={100}
                maximumValue={5000}
                value={customRange.min}
                onValueChange={(value) => handleCustomRangeChange(value, true)}
                minimumTrackTintColor="#007AFF"
                maximumTrackTintColor="#E5E5EA"
                // thumbStyle and trackStyle props not supported by @react-native-community/slider
                // Use thumbTintColor and track colors instead
              />
            </View>

            <View style={styles.sliderContainer}>
              <View style={styles.sliderRow}>
                <Text style={styles.sliderLabel}>Maximum:</Text>
                <Text style={styles.sliderValue}>{formatCurrency(customRange.max)}</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={customRange.min + 100}
                maximumValue={15000}
                value={customRange.max}
                onValueChange={(value) => handleCustomRangeChange(value, false)}
                minimumTrackTintColor="#007AFF"
                maximumTrackTintColor="#E5E5EA"
                // thumbStyle and trackStyle props not supported by @react-native-community/slider
                // Use thumbTintColor and track colors instead
              />
            </View>

            <View style={styles.rangeDisplay}>
              <Text style={styles.rangeDisplayText}>
                Your range: {formatCurrency(customRange.min)} - {formatCurrency(customRange.max)}
              </Text>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.continueButton,
            { opacity: selectedBudget ? 1 : 0.5 }
          ]}
          onPress={handleContinue}
          disabled={!selectedBudget}
          activeOpacity={0.7}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#6E6E73',
    lineHeight: 26,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  budgetOptions: {
    paddingHorizontal: 16,
  },
  budgetCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 8,
    marginBottom: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  budgetCardContent: {
    padding: 20,
    position: 'relative',
  },
  budgetHeader: {
    marginBottom: 8,
  },
  budgetTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  budgetName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1D1F',
    marginRight: 8,
  },
  popularBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  popularText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  budgetRange: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  budgetDescription: {
    fontSize: 16,
    color: '#6E6E73',
    lineHeight: 22,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  customRangeContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    margin: 16,
    padding: 24,
  },
  customRangeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 20,
    textAlign: 'center',
  },
  sliderContainer: {
    marginBottom: 20,
  },
  sliderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6E6E73',
  },
  sliderValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderThumb: {
    backgroundColor: '#007AFF',
    width: 24,
    height: 24,
  },
  sliderTrack: {
    height: 4,
    borderRadius: 2,
  },
  rangeDisplay: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  rangeDisplayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 34,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
  },
  continueButton: {
    flex: 2,
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    marginLeft: 12,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
});