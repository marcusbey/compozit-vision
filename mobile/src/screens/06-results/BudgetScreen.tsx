import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useJourneyStore } from '../../stores/journeyStore';
import { useUserStore } from '../../stores/userStore';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';
import JourneyProgressBar from '../../components/ProgressBar/JourneyProgressBar';

// Import style tokens from the design guide
const colors = {
  bgApp: '#FBF9F4',
  bgSecondary: '#F5F1E8',
  surface: '#FEFEFE',
  textPrimary: '#2D2B28',
  textSecondary: '#8B7F73',
  textMuted: '#B8AFA4',
  borderSoft: '#E6DDD1',
  borderWarm: '#D4C7B5',
  brand: '#D4A574',
  brandLight: '#E8C097',
  brandDark: '#B8935F',
  accent: '#2D2B28',
  accentSoft: '#5A564F',
  warm: '#E8C097',
  warmDark: '#D4A574',
};

interface BudgetScreenProps {
  navigation?: any;
  route?: any;
}

const BudgetScreen: React.FC<BudgetScreenProps> = ({ navigation }) => {
  const [budgetValue, setBudgetValue] = useState<number>(0.25); // Start at 25% of slider (50K)
  const journeyStore = useJourneyStore();
  const { isAuthenticated, user } = useUserStore();

  // Set current step when screen mounts
  useEffect(() => {
    journeyStore.setCurrentStep(6, 'budget');
  }, []);

  // Convert slider value to budget amount with 80/20 mapping
  const sliderValueToBudget = (value: number): number => {
    if (value <= 0.8) {
      // First 80%: 0-100K (detailed movement for most common budgets)
      return (value / 0.8) * 100000; // 0.8 = 100K
    } else {
      // Last 20%: 100K-500K+ (fast movement for high budgets)
      const remainingValue = value - 0.8; // 0-0.2 range
      return 100000 + (remainingValue / 0.2) * 400000; // 100K + 400K = 500K
    }
  };

  const formatBudget = (amount: number): string => {
    if (amount >= 500000) return '$500,000+';
    if (amount >= 100000) return `$${Math.round(amount / 1000)}K`;
    if (amount >= 1000) return `$${Math.round(amount / 1000)}K`;
    return `$${Math.round(amount).toLocaleString()}`;
  };

  const getBudgetDescription = (amount: number): string => {
    if (amount < 5000) return 'Budget-friendly refresh';
    if (amount < 15000) return 'Moderate makeover';
    if (amount < 50000) return 'Full transformation';
    if (amount < 100000) return 'Premium redesign';
    return 'Luxury complete renovation';
  };

  const currentBudget = sliderValueToBudget(budgetValue);

  const handleSliderChange = (value: number) => {
    setBudgetValue(value);
  };

  const handleContinue = () => {
    const finalBudget = sliderValueToBudget(budgetValue);
    
    // Save budget selection to journey store
    journeyStore.updateProject({
      budgetRange: {
        min: Math.max(0, finalBudget - 5000),
        max: finalBudget >= 500000 ? 1000000 : finalBudget + 5000,
        currency: 'USD',
      }
    });

    journeyStore.completeStep('budget');

    console.log('💰 Budget selected:', formatBudget(finalBudget));
    
    // Navigate to furniture selection screen
    console.log('💰 Budget selected, proceeding to furniture selection');
    NavigationHelpers.navigateToScreen('furnitureSelection');
  };

  const goBack = () => {
    NavigationHelpers.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Progress Bar */}
      <JourneyProgressBar />
      
      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Budget Range</Text>
      </View>
        
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.content}>
            <Text style={styles.subtitle}>What's your budget for this project?</Text>
            <Text style={styles.helperText}>Drag the slider to set your budget range</Text>
            
            {/* Budget Display */}
            <View style={styles.budgetDisplay}>
              <Text style={styles.budgetAmount}>
                {formatBudget(currentBudget)}
              </Text>
              <Text style={styles.budgetDescription}>
                {getBudgetDescription(currentBudget)}
              </Text>
            </View>
            
            {/* Custom Slider */}
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                value={budgetValue}
                onValueChange={handleSliderChange}
                minimumValue={0}
                maximumValue={1}
                minimumTrackTintColor={colors.brand}
                maximumTrackTintColor={colors.borderSoft}
                thumbTintColor={colors.brandDark}
              />
              
              {/* Slider Labels */}
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>$0</Text>
                <Text style={styles.sliderLabel}>$100K</Text>
                <Text style={styles.sliderLabel}>$500K+</Text>
              </View>
              
              {/* Slider Guide */}
              <Text style={styles.sliderGuide}>
                💡 First 80% covers $0-$100K for precise selection, last 20% covers $100K-$500K+
              </Text>
            </View>
            
            {/* Selection Summary */}
            <View style={styles.selectionSummary}>
              <Text style={styles.selectionText}>
                ✨ Perfect! We'll find amazing options around {formatBudget(currentBudget)}.
              </Text>
            </View>
            
            <TouchableOpacity 
              onPress={handleContinue}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[colors.brandLight, colors.brand] as [string, string]}
                style={styles.primaryButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.primaryButtonText}>
                  Continue with {formatBudget(currentBudget)}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    flex: 1,
    marginRight: 56,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  helperText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  budgetDisplay: {
    alignItems: 'center',
    marginBottom: 40,
    padding: 24,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  budgetAmount: {
    fontSize: 42,
    fontWeight: '700',
    color: colors.brand,
    marginBottom: 8,
    textAlign: 'center',
  },
  budgetDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  sliderContainer: {
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  slider: {
    width: '100%',
    height: 60,
    marginBottom: 20,
  },
  sliderThumb: {
    backgroundColor: colors.brandDark,
    width: 30,
    height: 30,
    borderRadius: 15,
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  sliderTrack: {
    height: 8,
    borderRadius: 4,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  sliderLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  sliderGuide: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  selectionSummary: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  selectionText: {
    fontSize: 14,
    color: colors.brand,
    textAlign: 'center',
    fontWeight: '500',
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 999,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: colors.brand,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  primaryButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BudgetScreen;